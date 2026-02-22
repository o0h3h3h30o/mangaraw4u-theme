"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LibraryTabs } from "@/components/library/library-tabs";
import { LibrarySkeleton } from "@/components/library/library-skeleton";

function LibraryPageContent() {
  const t = useTranslations("user.library");
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current tab from URL or default to "continue"
  const currentTab = searchParams.get("tab") || "continue";

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/library?${params.toString()}`, { scroll: false });
  };

  // Loading state (shouldn't happen on protected route)
  if (!isAuthenticated || !user) {
    return <LibrarySkeleton />;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Tabs Container */}
      <LibraryTabs activeTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryPageContent />
    </ProtectedRoute>
  );
}
