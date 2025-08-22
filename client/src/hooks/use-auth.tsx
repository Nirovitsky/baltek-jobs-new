import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { ApiClient } from "@/lib/api";
import type { UserProfile } from "@shared/schema";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!AuthService.isAuthenticated()) {
        return null;
      }
      try {
        // Fetch current user using available endpoint
        return await ApiClient.getCurrentUser() as UserProfile;
      } catch (error) {
        AuthService.clearTokens();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSuccess: () => {
      // Clear auth queries specifically and set user to null immediately
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
      navigate("/");
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
