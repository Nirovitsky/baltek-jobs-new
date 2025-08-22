import type { UserProfile } from "@shared/schema";

const API_BASE = "https://api.baltek.net/api";

export class AuthService {
  private static TOKEN_KEY = "baltek_access_token";
  private static REFRESH_TOKEN_KEY = "baltek_refresh_token";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
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
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
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
        if (response.status === 401) {
        } else {
        }
        this.clearTokens();
        throw new Error("Token refresh failed");
      }

      const { access } = await response.json();
      localStorage.setItem(this.TOKEN_KEY, access);
      return access;
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
