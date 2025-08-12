import { Switch, Route, Redirect } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Login from "@/pages/login";
import Register from "@/pages/register";
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
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/jobs" />;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );

  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Route>
      <Route path="/auth/callback">
        <AuthCallback />
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/applications">
        <ProtectedRoute>
          <ProtectedLayout>
            <Applications />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/bookmarks">
        <ProtectedRoute>
          <ProtectedLayout>
            <Bookmarks />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/chat">
        <ProtectedRoute>
          <ProtectedLayout>
            <Chat />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute>
          <ProtectedLayout>
            <Notifications />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/company/:id">
        <ProtectedRoute>
          <ProtectedLayout>
            <CompanyProfile />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/about-us">
        <ProtectedRoute>
          <ProtectedLayout>
            <AboutUs />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/contact-us">
        <ProtectedRoute>
          <ProtectedLayout>
            <ContactUs />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/terms">
        <ProtectedRoute>
          <ProtectedLayout>
            <Terms />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/privacy-policy">
        <ProtectedRoute>
          <ProtectedLayout>
            <PrivacyPolicy />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs/:id">
        <ProtectedRoute>
          <ProtectedLayout>
            <Jobs />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <ProtectedRoute>
          <ProtectedLayout>
            <Jobs />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Redirect to="/jobs" />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="baltek-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
