"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";

interface EditProfileFormProps {
  user: User;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const t = useTranslations("user.profile.editForm");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>{t("namePlaceholder")}</Label>
            <Input value={user.name} disabled className="bg-muted" />
          </div>

          <div>
            <Label>{t("emailPlaceholder")}</Label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
