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
      console.log('useAuth query running - checking authentication...');
      
      if (!AuthService.isAuthenticated()) {
        console.log('Not authenticated - AuthService.isAuthenticated() returned false');
        return null;
      }
      
      console.log('Authenticated! Fetching user profile...');
      
      try {
        // Get current user ID from token payload
        const token = AuthService.getToken();
        if (!token) {
          console.log('No token found');
          return null;
        }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;
        console.log('User ID from token:', userId);
        
        const profile = await ApiClient.getProfile(userId) as UserProfile;
        console.log('Profile fetched successfully:', profile);
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
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
