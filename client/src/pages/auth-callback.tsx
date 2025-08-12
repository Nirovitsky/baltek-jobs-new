import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { OAuth2PKCEService } from "@/lib/oauth";
import { AuthService } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(urlParams.get('error_description') || error);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Initialize OAuth service with same config as auth flow
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

        const oauthService = new OAuth2PKCEService(oauthConfig);
        
        // Exchange code for tokens with OAuth server
        const tokens = await oauthService.exchangeCodeForTokens(code, state);
        
        // The OAuth server handles authentication - we just store the resulting tokens
        AuthService.setTokens(tokens.access_token, tokens.refresh_token || '');
        
        // Invalidate auth queries to refresh user state immediately
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        
        setStatus('success');
        
        // Redirect to main page immediately after successful login
        setTimeout(() => {
          setLocation('/jobs');
        }, 1000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [setLocation, queryClient]);

  const handleRetry = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
            <span>
              {status === 'loading' && 'Completing Login...'}
              {status === 'success' && 'Login Successful!'}
              {status === 'error' && 'Login Failed'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                You have been successfully logged in!
              </p>
              <p className="text-muted-foreground text-sm">
                Redirecting you to the jobs page...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-600 font-medium">
                Authentication failed
              </p>
              {error && (
                <p className="text-muted-foreground text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </p>
              )}
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}