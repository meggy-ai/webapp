import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, AuthState } from "@/types/auth";
import { tokenManager } from "@/lib/api/client";

interface AuthActions {
  // Authentication actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;

  // User session actions
  login: (user: User, tokens: { access: string; refresh: string }) => void;
  logout: () => void;
  clearError: () => void;

  // User profile actions
  updateUser: (userData: Partial<User>) => void;
}

export interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // State setters
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Authentication actions
      login: (user, tokens) => {
        // Store tokens in cookies
        tokenManager.setToken(tokens.access);
        tokenManager.setRefreshToken(tokens.refresh);

        // Update auth state
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        // Clear tokens
        tokenManager.removeTokens();

        // Reset auth state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      // User profile actions
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: "meggy-auth-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist user data and auth status, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth hooks for common use cases
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
    updateUser: store.updateUser,
  };
};

export const useAuthUser = () => {
  const user = useAuthStore((state) => state.user);
  return user;
};

export const useAuthStatus = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  return { isAuthenticated, isLoading };
};
