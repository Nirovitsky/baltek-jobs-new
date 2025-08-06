import { Switch, Route, Redirect } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Jobs from "@/pages/jobs";
import Profile from "@/pages/profile";
import Applications from "@/pages/applications";
import Settings from "@/pages/settings";
import Chat from "@/pages/chat";
import Notifications from "@/pages/notifications";
import NotFound from "@/pages/not-found";

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
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();

  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
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
      <Route path="/">
        <ProtectedRoute>
          <ProtectedLayout>
            <Jobs searchQuery={searchQuery} />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
