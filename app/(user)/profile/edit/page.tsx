import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import EditProfilePageClient from "./EditProfilePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("user.profile");

  return {
    title: t("editProfile"),
    description: t("accountSettings"),
    robots: {
      index: false, // Don't index edit pages
      follow: false,
    },
  };
}

export default function EditProfilePage() {
  return <EditProfilePageClient />;
}
