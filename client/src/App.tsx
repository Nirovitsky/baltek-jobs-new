import { Switch, Route, Redirect } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";

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
    return <Redirect to="/jobs" />;
  }

  return <>{children}</>;
}



function Router() {
  const { isAuthenticated } = useAuth();

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );

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
        <Layout>
          <CompanyProfile />
        </Layout>
      </Route>
      <Route path="/about-us">
        <Layout>
          <AboutUs />
        </Layout>
      </Route>
      <Route path="/contact-us">
        <Layout>
          <ContactUs />
        </Layout>
      </Route>
      <Route path="/terms">
        <Layout>
          <Terms />
        </Layout>
      </Route>
      <Route path="/privacy-policy">
        <Layout>
          <PrivacyPolicy />
        </Layout>
      </Route>
      <Route path="/jobs/:id">
        <Layout>
          <Jobs />
        </Layout>
      </Route>
      <Route path="/jobs">
        <Layout>
          <Jobs />
        </Layout>
      </Route>
      <Route path="/">
        <Redirect to="/jobs" />
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
