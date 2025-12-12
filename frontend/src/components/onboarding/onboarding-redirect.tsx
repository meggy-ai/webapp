"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";

export function OnboardingRedirect() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if user is authenticated but hasn't completed onboarding
    if (isAuthenticated && user && !user.is_onboarding_completed) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, user, router]);

  return null;
}
