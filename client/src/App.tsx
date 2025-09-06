import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ImageCacheProvider } from "@/contexts/ImageCacheContext";
import { useAuth } from "@/hooks/use-auth";
import { useLanguagePersistence } from "@/hooks/use-language-persistence";
import Navbar from "@/components/navbar";
import NavbarSkeleton from "@/components/navbar-skeleton";
import { OnboardingGuard, OnboardingRouteGuard } from "@/components/onboarding-guard";
import ErrorBoundary from "@/components/error-boundary";

// Lazy load pages for code splitting
const Jobs = lazy(() => import("@/pages/jobs"));
const Profile = lazy(() => import("@/pages/profile"));
const Applications = lazy(() => import("@/pages/applications"));
const Bookmarks = lazy(() => import("@/pages/bookmarks"));
const Settings = lazy(() => import("@/pages/settings"));
const Chat = lazy(() => import("@/pages/chat"));
const Notifications = lazy(() => import("@/pages/notifications"));
const CompanyProfile = lazy(() => import("@/pages/company-profile"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const ContactUs = lazy(() => import("@/pages/contact-us"));
const Terms = lazy(() => import("@/pages/terms"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const Onboarding = lazy(() => import("@/pages/onboarding"));

// Loading skeleton component
const PageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/jobs" replace />;
  }

  return <>{children}</>;
}



function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize language persistence
  useLanguagePersistence();

  // Unified layout component with optional authentication requirement
  const AppLayout = ({ 
    children, 
    requireAuth = false 
  }: { 
    children: React.ReactNode; 
    requireAuth?: boolean;
  }) => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      return <Navigate to="/jobs" replace />;
    }

    return (
              <div className="h-screen bg-background flex flex-col overflow-hidden">
          {isLoading ? <NavbarSkeleton /> : <Navbar />}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
    );
  };

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <OnboardingRouteGuard>
                <Onboarding />
              </OnboardingRouteGuard>
            </ProtectedRoute>
          } 
        />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Profile />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Applications />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bookmarks" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Bookmarks />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Settings />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Chat />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <AppLayout requireAuth={true}>
                <Notifications />
              </AppLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company/:id" 
        element={
          <AppLayout>
            <CompanyProfile />
          </AppLayout>
        } 
      />
      <Route 
        path="/about-us" 
        element={
          <AppLayout>
            <AboutUs />
          </AppLayout>
        } 
      />
      <Route 
        path="/contact-us" 
        element={
          <AppLayout>
            <ContactUs />
          </AppLayout>
        } 
      />
      <Route 
        path="/terms" 
        element={
          <AppLayout>
            <Terms />
          </AppLayout>
        } 
      />
      <Route 
        path="/privacy-policy" 
        element={
          <AppLayout>
            <PrivacyPolicy />
          </AppLayout>
        } 
      />
      <Route 
        path="/jobs/:id" 
        element={
          <AppLayout>
            <Jobs />
          </AppLayout>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <AppLayout>
            <OnboardingGuard>
              <Jobs />
            </OnboardingGuard>
          </AppLayout>
        } 
      />
      <Route 
        path="/" 
        element={
          <AppLayout>
            <OnboardingGuard>
              <Jobs />
            </OnboardingGuard>
          </AppLayout>
        } 
      />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="baltek-ui-theme">
          <ImageCacheProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ImageCacheProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
