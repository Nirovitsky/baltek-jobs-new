import { useEffect } from "react";
import { OAuth2PKCEService } from "@/lib/oauth";
import { AuthService } from "@/lib/auth";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', urlParams.get('error_description') || error);
          window.location.href = '/jobs?auth_error=1';
          return;
        }

        if (!code || !state) {
          console.error('Missing authorization code or state parameter');
          window.location.href = '/jobs?auth_error=1';
          return;
        }

        // Initialize OAuth service with same config as auth flow
        const oauthConfig = {
          clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
          authorizationUrl: import.meta.env.VITE_OAUTH_AUTH_URL || '',
          tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL || '',
          redirectUri: `${window.location.origin}/auth/callback`,
          scopes: [],
        };

        const oauthService = new OAuth2PKCEService(oauthConfig);
        
        // Exchange code for tokens with OAuth server
        const tokens = await oauthService.exchangeCodeForTokens(code, state);
        
        // Store tokens and redirect immediately to jobs page
        AuthService.setTokens(tokens.access_token, tokens.refresh_token || '');
        window.location.href = '/jobs';

      } catch (error) {
        console.error('OAuth callback error:', error);
        window.location.href = '/jobs?auth_error=1';
      }
    };

    handleCallback();
  }, []);

  // Return null - no UI needed since we redirect immediately
  return null;
}