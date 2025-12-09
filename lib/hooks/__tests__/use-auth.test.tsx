import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useLogin,
  useRegister,
  useLogout,
  useUpdateProfile,
  useCompleteOnboarding,
} from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

// Mock the auth store
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockSetLoading = jest.fn();
const mockSetError = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: () => ({
    login: mockLogin,
    logout: mockLogout,
    setLoading: mockSetLoading,
    setError: mockSetError,
    updateUser: mockUpdateUser,
    isAuthenticated: true,
  }),
  useAuth: () => ({
    user: {
      id: "1",
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe",
      is_onboarding_completed: false,
    },
    isAuthenticated: true,
  }),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("Auth Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useLogin", () => {
    it("should handle successful login", async () => {
      const mockResponse = {
        data: {
          user: { id: "1", email: "test@example.com" },
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: "test@example.com",
          password: "password123",
        });
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.data.user, {
        access: mockResponse.data.access_token,
        refresh: mockResponse.data.refresh_token,
      });
      expect(toast.success).toHaveBeenCalledWith("Successfully logged in!");
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it("should handle login failure", async () => {
      const mockError = new Error("Invalid credentials");
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            email: "test@example.com",
            password: "wrongpassword",
          });
        } catch {
          // Expected to throw
        }
      });

      expect(mockSetError).toHaveBeenCalledWith("Login failed");
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(toast.error).toHaveBeenCalledWith("Login failed");
    });
  });

  describe("useRegister", () => {
    it("should handle successful registration", async () => {
      const mockResponse = {
        data: { message: "Registration successful" },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: "test@example.com",
          username: "testuser",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
          acceptTerms: true,
        });
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith(
        "Registration successful! Please check your email to verify your account."
      );
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("useLogout", () => {
    it("should handle successful logout", async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockLogout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Successfully logged out");
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it("should logout locally even if server request fails", async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("useUpdateProfile", () => {
    it("should handle successful profile update", async () => {
      const mockResponse = {
        data: {
          id: "1",
          email: "test@example.com",
          first_name: "Jane",
          last_name: "Doe",
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      const updateData = { first_name: "Jane" };

      await act(async () => {
        await result.current.mutateAsync(updateData);
      });

      expect(mockUpdateUser).toHaveBeenCalledWith(mockResponse.data);
      expect(toast.success).toHaveBeenCalledWith("Profile updated successfully!");
    });
  });

  describe("useCompleteOnboarding", () => {
    it("should handle successful onboarding completion", async () => {
      const mockResponse = { data: { message: "Onboarding completed" } };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ is_onboarding_completed: true });
      expect(toast.success).toHaveBeenCalledWith("Onboarding completed!");
    });
  });
});
