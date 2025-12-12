import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS as ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoginCredentials, RegisterCredentials, User } from "@/types/auth";
import { toast } from "sonner";

// Authentication mutations
export const useLogin = () => {
  const { login, setLoading, setError } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      const { user, access_token, refresh_token } = data;
      login(user, { access: access_token, refresh: refresh_token });

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Successfully logged in!");
      setLoading(false);
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Login failed";
      setError(message);
      setLoading(false);
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, credentials);
      return response.data;
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      toast.success("Registration successful! Please check your email to verify your account.");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Registration failed";
      setError(message);
      setLoading(false);
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { logout, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      logout();

      // Clear all queries
      queryClient.clear();

      toast.success("Successfully logged out");
      setLoading(false);
    },
    onError: (error: unknown) => {
      // Still logout locally even if server request fails
      logout();
      queryClient.clear();

      const message = (error as ApiError)?.response?.data?.message || "Logout failed";
      toast.error(message);
      setLoading(false);
    },
  });
};

// User profile queries
export const useUserProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await apiClient.get(ENDPOINTS.USER.PROFILE);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiClient.patch(ENDPOINTS.USER.PROFILE, userData);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);

      // Update cached queries
      queryClient.setQueryData(["user", "profile"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });
};

// Password and security
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      const response = await apiClient.post(ENDPOINTS.USER.CHANGE_PASSWORD, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Failed to change password";
      toast.error(message);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset link sent to your email!");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Failed to send reset link";
      toast.error(message);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Failed to reset password";
      toast.error(message);
    },
  });
};

// Email verification
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email verified successfully!");
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || "Email verification failed";
      toast.error(message);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(ENDPOINTS.AUTH.RESEND_VERIFICATION);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: unknown) => {
      const message =
        (error as ApiError)?.response?.data?.message || "Failed to send verification email";
      toast.error(message);
    },
  });
};

export const useCompleteOnboarding = () => {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(ENDPOINTS.USERS.COMPLETE_ONBOARDING);
      return response.data;
    },
    onSuccess: () => {
      updateUser({ is_onboarding_completed: true });
      toast.success("Onboarding completed!");
    },
    onError: (error: unknown) => {
      const message =
        (error as ApiError)?.response?.data?.message || "Failed to complete onboarding";
      toast.error(message);
    },
  });
};
