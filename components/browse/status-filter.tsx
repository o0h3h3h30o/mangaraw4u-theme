"use client";

/**
 * Status Filter Component
 * Dropdown select for filtering manga by status (All/Ongoing/Completed)
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
import { MangaStatus } from "@/types/manga";

export interface StatusFilterProps {
  value: string; // "all" for all, "1" for ongoing, "2" for completed
  onChange: (value: string) => void;
  className?: string;
  hideLabel?: boolean;
}

const STATUS_OPTIONS = [
  { value: "all", labelKey: "all" },
  { value: String(MangaStatus.ONGOING), labelKey: "ongoing" },
  { value: String(MangaStatus.COMPLETED), labelKey: "completed" },
] as const;

/**
 * Status filter component for browse page
 *
 * @param value - Current selected status ("all" | "1" | "2")
 * @param onChange - Callback when status changes
 * @param className - Optional additional CSS classes
 * @param hideLabel - Hide the label (useful for compact layouts)
 */
export function StatusFilter({
  value,
  onChange,
  className,
  hideLabel = false,
}: StatusFilterProps) {
  const t = useTranslations("browse.status");

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
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
