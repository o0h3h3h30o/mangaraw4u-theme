"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProfileHeader } from "@/components/user/profile-header";
import { ProfileStats } from "@/components/user/profile-stats";
import { ProfileAchievements } from "@/components/user/profile-achievements";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";

function ProfilePageContent() {
  const t = useTranslations("user.profile");
  const { user, isAuthenticated } = useAuth();

  // Loading state (shouldn't happen on protected route, but safety)
  if (!isAuthenticated || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ProfileHeader user={user} />

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          {t("sections.statistics")}
        </h2>
        <ProfileStats user={user} />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          {t("sections.achievements")}
        </h2>
        <ProfileAchievements pet={user.pet} achievement={user.achievement} />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
