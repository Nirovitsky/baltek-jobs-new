import type { UserProfile } from "@shared/schema";

const API_BASE = "https://api.baltek.net/api";

export class AuthService {
  private static TOKEN_KEY = "baltek_access_token";
  private static REFRESH_TOKEN_KEY = "baltek_refresh_token";
  private static TOKEN_EXPIRES_KEY = "baltek_token_expires";
  private static refreshPromise: Promise<string> | null = null;

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string, expiresIn?: number): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    
    // Store token expiration time (default to 1 hour if not provided)
    const expirationTime = Date.now() + (expiresIn ? expiresIn * 1000 : 3600 * 1000);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expirationTime.toString());
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    this.refreshPromise = null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getTokenExpiresAt(): number | null {
    const expires = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return expires ? parseInt(expires, 10) : null;
  }

  static isTokenExpiringSoon(bufferMinutes: number = 5): boolean {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return true; // Assume expiring if no expiration info
    
    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() + bufferMs >= expiresAt;
  }

  static async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    // If token is expiring soon, refresh it proactively
    if (this.isTokenExpiringSoon()) {
      try {
        return await this.ensureTokenRefreshed();
      } catch (error) {
        console.warn('Failed to refresh token proactively:', error);
        return token; // Return current token as fallback
      }
    }

    return token;
  }

  static async ensureTokenRefreshed(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private static async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newAccessToken = data.access;
      
      // Update only the access token, keep the same refresh token and set new expiration
      localStorage.setItem(this.TOKEN_KEY, newAccessToken);
      
      // Set expiration time (assume 1 hour if not provided)
      const expiresIn = data.expires_in || 3600;
      const expirationTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.TOKEN_EXPIRES_KEY, expirationTime.toString());
      
      return newAccessToken;
    } catch (error) {
      // Don't clear tokens here - let the calling code decide
      throw error;
    }
  }



  // OAuth2 PKCE login initiation - delegates authentication to OAuth server
  static async startOAuthLogin(): Promise<void> {
    const { OAuth2PKCEService } = await import('./oauth');
    
    const oauthConfig = {
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
      authorizationUrl: import.meta.env.VITE_OAUTH_AUTH_URL || '',
      tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL || '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: [],
    };

    if (!oauthConfig.clientId || !oauthConfig.authorizationUrl) {
      throw new Error('OAuth configuration missing. Please set VITE_OAUTH_CLIENT_ID and VITE_OAUTH_AUTH_URL environment variables.');
    }

    const oauthService = new OAuth2PKCEService(oauthConfig);
    const authUrl = await oauthService.startAuthFlow();
    
    // Redirect to OAuth server for authentication - they handle the auth flow
    window.location.href = authUrl;
  }



  static async refreshToken(): Promise<string> {
    try {
      return await this.ensureTokenRefreshed();
    } catch (error) {
      this.clearTokens();
      throw new Error("Token refresh failed");
    }
  }

  static async logout(): Promise<void> {
    
    // Clear local tokens first
    this.clearTokens();
    
    // Redirect to Baltek OAuth logout endpoint
    try {
      const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
      const homeUrl = `${window.location.origin}/`;
      
      if (clientId) {
        const logoutUrl = `https://api.baltek.net/api/oauth2/logout/?client_id=${encodeURIComponent(clientId)}&post_logout_redirect_uri=${encodeURIComponent(homeUrl)}`;
        window.location.href = logoutUrl;
      } else {
        // Fallback to local redirect if no client ID
        window.location.href = "/";
      }
    } catch (error) {
      // Fallback to local redirect
      window.location.href = "/";
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
