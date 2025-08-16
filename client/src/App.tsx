import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ImageCacheProvider } from "@/contexts/ImageCacheContext";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import NavbarSkeleton from "@/components/navbar-skeleton";

import Jobs from "@/pages/jobs";
import Profile from "@/pages/profile";
import Applications from "@/pages/applications";
import Bookmarks from "@/pages/bookmarks";
import Settings from "@/pages/settings";
import Chat from "@/pages/chat";
import Notifications from "@/pages/notifications";
import CompanyProfile from "@/pages/company-profile";
import NotFound from "@/pages/not-found";
import AboutUs from "@/pages/about-us";
import ContactUs from "@/pages/contact-us";
import Terms from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy-policy";
import AuthCallback from "@/pages/auth-callback";
import Onboarding from "@/pages/onboarding";
import { OnboardingGuard, OnboardingRouteGuard } from "@/components/onboarding-guard";


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

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {isLoading ? <NavbarSkeleton /> : <Navbar />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );

  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {isLoading ? <NavbarSkeleton /> : <Navbar />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );

  return (
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
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProtectedLayout>
                <Applications />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bookmarks" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProtectedLayout>
                <Bookmarks />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProtectedLayout>
                <Chat />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProtectedLayout>
                <Notifications />
              </ProtectedLayout>
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company/:id" 
        element={
          <Layout>
            <CompanyProfile />
          </Layout>
        } 
      />
      <Route 
        path="/about-us" 
        element={
          <Layout>
            <AboutUs />
          </Layout>
        } 
      />
      <Route 
        path="/contact-us" 
        element={
          <Layout>
            <ContactUs />
          </Layout>
        } 
      />
      <Route 
        path="/terms" 
        element={
          <Layout>
            <Terms />
          </Layout>
        } 
      />
      <Route 
        path="/privacy-policy" 
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        } 
      />
      <Route 
        path="/jobs/:id" 
        element={
          <Layout>
            <Jobs />
          </Layout>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <Layout>
            <OnboardingGuard>
              <Jobs />
            </OnboardingGuard>
          </Layout>
        } 
      />
      <Route 
        path="/" 
        element={
          <Layout>
            <OnboardingGuard>
              <Jobs />
            </OnboardingGuard>
          </Layout>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
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
  );
}

export default App;
