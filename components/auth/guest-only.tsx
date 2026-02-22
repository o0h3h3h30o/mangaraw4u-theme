"use client";

/**
 * Guest Only Component
 * Wrapper component that ensures only unauthenticated users can access the content
 * Redirects authenticated users to home page or specified redirect
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/routes";

interface GuestOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

function GuestOnlyContent({
  children,
  fallback,
  redirectTo = DEFAULT_LOGIN_REDIRECT,
}: GuestOnlyProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure Zustand hydration from localStorage is complete
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // If user is already logged in, redirect to home or specified page
        const redirect = searchParams.get("redirect") || redirectTo;
        router.push(redirect);
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, searchParams, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking || isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )
    );
  }

  // User is not authenticated, render children
  return <>{children}</>;
}

export function GuestOnly(props: GuestOnlyProps) {
  return (
    <Suspense
      fallback={
        props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        )
      }
    >
      <GuestOnlyContent {...props} />
    </Suspense>
  );
}
