"use client";

/**
 * Protected Route Component
 * Wrapper component that ensures only authenticated users can access the content
 * Redirects unauthenticated users to login page
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure Zustand hydration from localStorage is complete
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        // Store current path for redirect after login
        const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, pathname]);

  // Show loading state while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
