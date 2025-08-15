import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { ApiClient } from "@/lib/api";

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
  // Check localStorage for onboarding completion since API doesn't have this field
  if (isAuthenticated && user && !ApiClient.isOnboardingCompleted(user.id)) {
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
  if (user && ApiClient.isOnboardingCompleted(user.id)) {
    return <Redirect to="/jobs" />;
  }

  return <>{children}</>;
}