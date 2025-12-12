"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && !user.is_onboarding_completed) {
      // Redirect to onboarding if user hasn't completed it
      router.push("/onboarding");
    }
  }, [isAuthenticated, user, router]);

  // Don't render children if onboarding is incomplete
  if (isAuthenticated && user && !user.is_onboarding_completed) {
    return null;
  }

  return <>{children}</>;
}
