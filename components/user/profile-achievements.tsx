"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Pet, Achievement } from "@/types/user";

interface ProfileAchievementsProps {
  pet?: Pet | null;
  achievement?: Achievement | null;
}

export function ProfileAchievements({
  pet,
  achievement,
}: ProfileAchievementsProps) {
  const t = useTranslations("user.profile");
  const tUser = useTranslations("user");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pet Card */}
      <Card>
        <CardHeader>
          <CardTitle>{tUser("currentPet")}</CardTitle>
        </CardHeader>
        <CardContent>
          {pet ? (
            <div className="flex items-center gap-4">
              <Image
                src={pet.image}
                alt={pet.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.description}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {pet.points} {tUser("points")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("emptyStates.noAchievements")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievement Card */}
      <Card>
        <CardHeader>
          <CardTitle>{tUser("achievements")}</CardTitle>
        </CardHeader>
        <CardContent>
          {achievement ? (
            <div className="flex items-center gap-4">
              <Image
                src={achievement.icon}
                alt={achievement.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {achievement.points} {tUser("points")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("emptyStates.noAchievements")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
