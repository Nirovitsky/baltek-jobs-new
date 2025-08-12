import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { ApiClient } from "@/lib/api";
import type { UserProfile } from "@shared/schema";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!AuthService.isAuthenticated()) {
        return null;
      }
      try {
        // Get current user ID from token payload
        const token = AuthService.getToken();
        if (!token) return null;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;
        
        return await ApiClient.getProfile(userId) as UserProfile;
      } catch (error) {
        AuthService.clearTokens();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}
