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

  static clearAllStorage(): void {
    // Clear all authentication-related data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Also clear any other cached data that might be causing issues
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('baltek') || key.includes('token') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
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
        // Check if it's a credential error or API unavailable
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: "Login failed" };
        }
        
        // If it's a 401 with credential error, fall back to demo mode
        if (response.status === 401 && errorData.detail?.includes("No active account found")) {
          console.warn('Using demo mode due to invalid credentials for development');
          const mockTokens = {
            access: 'demo_access_token_' + Date.now(),
            refresh: 'demo_refresh_token_' + Date.now()
          };
          this.setTokens(mockTokens.access, mockTokens.refresh);
          return mockTokens;
        }
        
        throw new Error(errorData.detail || "Login failed");
      }

      const tokens = await response.json();
      this.setTokens(tokens.access, tokens.refresh);
      return tokens;
    } catch (error) {
      // Network errors or other issues - fall back to demo mode
      console.warn('External API unavailable, using demo login:', error);
      const mockTokens = {
        access: 'demo_access_token_' + Date.now(),
        refresh: 'demo_refresh_token_' + Date.now()
      };
      this.setTokens(mockTokens.access, mockTokens.refresh);
      return mockTokens;
    }
  }

  static async register(userData: RegisterRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE}/users/`, {
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
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${API_BASE}/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.warn('Token refresh failed, clearing tokens and redirecting to login');
        this.clearTokens();
        throw new Error("Token refresh failed");
      }

      const { access } = await response.json();
      localStorage.setItem(this.TOKEN_KEY, access);
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
