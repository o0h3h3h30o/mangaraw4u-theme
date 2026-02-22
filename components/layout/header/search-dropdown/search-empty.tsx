"use client";

/**
 * SearchEmpty Component
 * Displays when no search results are found
 */

import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";

export function SearchEmpty() {
  const t = useTranslations("search");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <p className="font-semibold text-sm text-foreground mb-1">
        {t("noResultsTitle")}
      </p>
      <p className="text-xs text-muted-foreground">{t("noResultsMessage")}</p>
    </div>
  );
}
