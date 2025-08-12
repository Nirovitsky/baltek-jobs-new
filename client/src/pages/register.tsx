import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Shield } from "lucide-react";
import { useState } from "react";

export default function Register() {
  const [oauthLoading, setOauthLoading] = useState(false);
  const { toast } = useToast();

  const handleOAuthSignup = async () => {
    try {
      setOauthLoading(true);
      await AuthService.startOAuthLogin();
    } catch (error) {
      console.error('OAuth signup failed:', error);
      toast({
        title: "OAuth Signup Failed",
        description: error instanceof Error ? error.message : "Failed to start OAuth signup",
        variant: "destructive",
      });
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Baltek Jobs</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">Create your account</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Create your account with secure OAuth authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              className="w-full"
              onClick={handleOAuthSignup}
              disabled={oauthLoading}
            >
              <Shield className="mr-2 h-4 w-4" />
              {oauthLoading ? "Connecting..." : "Sign up with OAuth"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" onClick={handleOAuthSignup} disabled={oauthLoading}>
                  Sign in with OAuth
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}