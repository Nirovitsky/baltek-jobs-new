// OAuth2 with PKCE implementation - handles token exchange, OAuth server handles authentication

interface OAuthConfig {
  clientId: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

interface PKCETokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export class OAuth2PKCEService {
  private config: OAuthConfig;
  private static CODE_VERIFIER_KEY = "oauth_code_verifier";
  private static STATE_KEY = "oauth_state";

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  // Generate cryptographically random string for PKCE
  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  // Generate SHA256 hash and base64url encode
  private async sha256(plain: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(digest);
  }

  // Base64URL encode (no padding)
  private base64URLEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Generate PKCE challenge pair
  private async generatePKCEChallenge(): Promise<{ verifier: string; challenge: string }> {
    const verifier = this.generateRandomString(128);
    const challenge = await this.sha256(verifier);
    return { verifier, challenge };
  }

  // Generate authorization URL with PKCE - OAuth server handles actual authentication
  async startAuthFlow(): Promise<string> {
    const { verifier, challenge } = await this.generatePKCEChallenge();
    const state = this.generateRandomString(32);

    // Store verifier and state in localStorage
    localStorage.setItem(OAuth2PKCEService.CODE_VERIFIER_KEY, verifier);
    localStorage.setItem(OAuth2PKCEService.STATE_KEY, state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    // Only add scope parameter if scopes are configured
    if (this.config.scopes.length > 0) {
      params.set('scope', this.config.scopes.join(' '));
    }

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  // Exchange authorization code for tokens - OAuth server validates and issues tokens
  async exchangeCodeForTokens(code: string, state: string): Promise<PKCETokens> {
    
    // Verify state parameter
    const storedState = localStorage.getItem(OAuth2PKCEService.STATE_KEY);
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Get stored code verifier
    const codeVerifier = localStorage.getItem(OAuth2PKCEService.CODE_VERIFIER_KEY);
    if (!codeVerifier) {
      throw new Error('Code verifier not found - restart auth flow');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code: code,
      redirect_uri: this.config.redirectUri,
      code_verifier: codeVerifier,
    });


    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });


    if (!response.ok) {
      const responseText = await response.text();
      
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { error: responseText || 'Token exchange failed' };
      }
      
      throw new Error(error.error_description || error.error || `Token exchange failed (${response.status}): ${responseText}`);
    }

    const tokens = await response.json();

    // Clean up stored PKCE data
    localStorage.removeItem(OAuth2PKCEService.CODE_VERIFIER_KEY);
    localStorage.removeItem(OAuth2PKCEService.STATE_KEY);

    return tokens;
  }

  // Refresh access token
  async refreshTokens(refreshToken: string): Promise<PKCETokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      refresh_token: refreshToken,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Token refresh failed' }));
      throw new Error(error.error_description || error.error || 'Token refresh failed');
    }

    return response.json();
  }

  // Logout and revoke tokens
  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    // Revoke refresh token if available
    if (refreshToken) {
      try {
        await fetch(`${this.config.tokenUrl.replace('/token', '/revoke')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: refreshToken,
            client_id: this.config.clientId,
          }).toString(),
        });
      } catch (error) {
      }
    }

    // Revoke access token
    try {
      await fetch(`${this.config.tokenUrl.replace('/token', '/revoke')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: this.config.clientId,
        }).toString(),
      });
    } catch (error) {
    }

    // Clean up any stored auth data
    localStorage.removeItem(OAuth2PKCEService.CODE_VERIFIER_KEY);
    localStorage.removeItem(OAuth2PKCEService.STATE_KEY);
  }
}