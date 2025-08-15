import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { OAuth2PKCEService } from "@/lib/oauth";
import { AuthService } from "@/lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', urlParams.get('error_description') || error);
          navigate('/jobs?auth_error=1');
          return;
        }

        if (!code || !state) {
          console.error('Missing authorization code or state parameter');
          navigate('/jobs?auth_error=1');
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
        
        // Invalidate auth queries to update navbar and user state immediately
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        
        navigate('/jobs');

      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/jobs?auth_error=1');
      }
    };

    handleCallback();
  }, [navigate]);

  // Return null - no UI needed since we redirect immediately
  return null;
}