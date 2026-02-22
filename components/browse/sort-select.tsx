"use client";

/**
 * Sort Select Component
 * Dropdown for selecting manga sort order
 */

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "-updated_at" | "-views" | "-rating" | "name";

export interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
  hideLabel?: boolean;
}

const SORT_OPTIONS: SortOption[] = ["-updated_at", "-views", "-rating", "name"];

/**
 * Sort select component for browse page
 *
 * @param value - Current selected sort option
 * @param onChange - Callback when sort changes
 * @param className - Optional additional CSS classes
 * @param hideLabel - Hide the label (useful for compact layouts)
 */
export function SortSelect({
  value,
  onChange,
  className,
  hideLabel = false,
}: SortSelectProps) {
  const t = useTranslations("browse.sort");

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "-updated_at":
        return t("latest");
      case "-views":
        return t("views");
      case "-rating":
        return t("rating");
      case "name":
        return t("name");
      default:
        return option;
    }
  };

  return (
    <div className={className}>
      {!hideLabel && (
        <Label className="text-sm font-medium mb-2 block">{t("label")}</Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("label")} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {getSortLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
