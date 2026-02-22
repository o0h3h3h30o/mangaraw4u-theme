"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";

interface ProfileStatsProps {
  user: User;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const t = useTranslations("user.profile.fields");

  // Defensive programming: handle cases where fields might be missing
  const stats = [
    { label: t("totalPoints"), value: user.total_points ?? 0 },
    { label: t("usedPoints"), value: user.used_points ?? 0 },
    { label: t("availablePoints"), value: user.available_points ?? 0 },
    { label: t("achievementsPoints"), value: user.achievements_points ?? 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stat.value.toLocaleString("vi-VN")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
