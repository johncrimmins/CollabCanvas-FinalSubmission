"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AuthLoadingScreen } from "@/components/layout/AuthLoadingScreen";
import { AuthErrorScreen } from "@/components/layout/AuthErrorScreen";
import { ProtectedAppShell } from "@/components/layout/ProtectedAppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthGuard();
  const router = useRouter();
  const [timeout, setTimeout] = useState(false);

  useEffect(() => {
    // Redirect to auth page if not authenticated
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Set timeout to show error if loading takes too long (Firebase not configured)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (loading) {
        setTimeout(true);
      }
    }, 3000); // 3 seconds timeout

    return () => window.clearTimeout(timer);
  }, [loading]);

  // Show loading state during initial auth check
  if (loading && !timeout) {
    return <AuthLoadingScreen />;
  }

  // Show error if loading is stuck (Firebase not configured)
  if (loading && timeout) {
    return <AuthErrorScreen onRetry={() => router.refresh()} />;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Render children when authenticated
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}

