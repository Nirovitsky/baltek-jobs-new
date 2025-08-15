import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only check onboarding status for authenticated users
  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (isAuthenticated && user && user.is_jobs_onboarding_completed === false) {
    return <Redirect to="/onboarding" />;
  }

  return <>{children}</>;
}

interface OnboardingRouteGuardProps {
  children: React.ReactNode;
}

export function OnboardingRouteGuard({ children }: OnboardingRouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to jobs
  if (!isAuthenticated) {
    return <Redirect to="/jobs" />;
  }

  // If user is authenticated and already completed onboarding, redirect to jobs
  if (user && user.is_jobs_onboarding_completed === true) {
    return <Redirect to="/jobs" />;
  }

  return <>{children}</>;
}