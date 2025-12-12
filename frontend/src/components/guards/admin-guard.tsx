"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated } = useAuth();
  const { canAccessAdmin } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !canAccessAdmin()) {
      // Redirect users without admin access back to dashboard
      router.push("/dashboard");
    }
  }, [isAuthenticated, canAccessAdmin, router]);

  // Show loading or access denied for users without admin access
  if (!isAuthenticated) {
    return null;
  }

  if (!canAccessAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. This area is restricted to administrators and moderators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
