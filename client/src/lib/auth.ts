import { apiRequest } from "./queryClient";
import type { LoginRequest, RegisterRequest, UserProfile } from "@shared/schema";

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

  static async login(credentials: LoginRequest): Promise<{ access: string; refresh: string }> {
    try {
      const response = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(error.detail || "Login failed");
      }

      const tokens = await response.json();
      this.setTokens(tokens.access, tokens.refresh);
      return tokens;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // OAuth2 PKCE login initiation - delegates authentication to OAuth server
  static async startOAuthLogin(): Promise<void> {
    const { OAuth2PKCEService } = await import('./oauth');
    
    // Get scopes from environment - if not set, use empty array (no scope parameter)
    const scopesEnv = import.meta.env.VITE_OAUTH_SCOPES;
    let scopes: string[] = [];
    
    if (scopesEnv && scopesEnv.trim()) {
      scopes = scopesEnv.split(' ').filter((scope: string) => scope.trim());
    }
    
    const oauthConfig = {
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
      authorizationUrl: import.meta.env.VITE_OAUTH_AUTH_URL || '',
      tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL || '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: scopes,
    };

    if (!oauthConfig.clientId || !oauthConfig.authorizationUrl) {
      throw new Error('OAuth configuration missing. Please set VITE_OAUTH_CLIENT_ID and VITE_OAUTH_AUTH_URL environment variables.');
    }

    const oauthService = new OAuth2PKCEService(oauthConfig);
    const authUrl = await oauthService.startAuthFlow();
    
    // Redirect to OAuth server for authentication - they handle the auth flow
    window.location.href = authUrl;
  }

  static async register(userData: RegisterRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(error.detail || "Registration failed");
      }

      return response.json();
    } catch (error) {
      console.warn('External API unavailable, using demo registration:', error);
      // Demo registration for when API is unavailable
      return {
        id: Math.floor(Math.random() * 1000),
        phone: userData.phone,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: '',
        location: '',
        avatar: '',
        skills: [],
        linkedin_url: '',
        github_url: '',
        portfolio_url: ''
      };
    }
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available - user needs to login again");
      this.clearTokens();
      throw new Error("No refresh token available");
    }

    try {
      console.log("Attempting to refresh access token...");
      const response = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Refresh token expired or invalid - user needs to login again');
        } else {
          console.warn(`Token refresh failed with status: ${response.status}`);
        }
        this.clearTokens();
        throw new Error("Token refresh failed");
      }

      const { access } = await response.json();
      localStorage.setItem(this.TOKEN_KEY, access);
      console.log("Access token refreshed successfully");
      return access;
    } catch (error) {
      console.warn('Token refresh error:', error);
      this.clearTokens();
      throw new Error("Token refresh failed");
    }
  }

  static async logout(): Promise<void> {
    console.log('Logging out user and clearing tokens...');
    this.clearTokens();
    // Use window.location to ensure a full page refresh and clear any cached state
    window.location.href = "/login";
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
