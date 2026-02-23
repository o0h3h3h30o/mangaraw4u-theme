"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";
import type { User } from "@/types/user";

interface ProfileHeaderProps {
  user: User;
  onEditClick?: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  const t = useTranslations("user.profile");

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_full_url} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Link prefetch={false} href="/profile/edit">
          <Button onClick={onEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            {t("editProfile")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
