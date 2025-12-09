import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { tokenManager } from "@/lib/api/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/auth/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, setAuthenticated, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();

      if (!token && requireAuth) {
        router.push(redirectTo);
        return;
      }

      if (token && !isAuthenticated) {
        // Token exists but user is not authenticated in store
        // This can happen after page refresh
        try {
          // The API client will handle token validation
          // If token is invalid, it will be cleared automatically
          setAuthenticated(true);
        } catch {
          // Token is invalid, redirect to login
          router.push(redirectTo);
        }
      }

      if (!requireAuth && isAuthenticated && redirectTo === "/auth/login") {
        // User is authenticated but trying to access auth pages
        router.push("/dashboard");
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo, setAuthenticated, setUser]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Don't render children until auth check is complete
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated && redirectTo === "/auth/login") {
    return null;
  }

  return <>{children}</>;
}

// Hook for protecting routes
export function useAuthGuard(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  return { isAuthenticated, isLoading };
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth: boolean = true
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={requireAuth}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Protected route wrapper for app directory
export function ProtectedRoute({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
