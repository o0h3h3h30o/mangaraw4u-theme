"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CommentableType } from "@/types/comment";

interface CommentBadgeProps {
  type: CommentableType;
  variant?: "default" | "compact";
  className?: string;
  showTooltip?: boolean;
}

export function CommentBadge({
  type,
  variant = "default",
  className,
  showTooltip = true,
}: CommentBadgeProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const t = useTranslations("comment.badge");

  const config = {
    chapter: {
      color: "bg-blue-500",
      label: t("chapter"),
      ariaLabel: t("chapterAria"),
      tooltip: t("chapterTooltip"),
    },
    manga: {
      color: "bg-purple-500",
      label: t("manga"),
      ariaLabel: t("mangaAria"),
      tooltip: t("mangaTooltip"),
    },
  };

  // Normalize Laravel model class names to simple type strings
  const normalizedType = type
    ? type.replace(/^App\\Models\\/, "").toLowerCase() // Convert "App\Models\Manga" to "manga"
    : type;

  // Defensive check for invalid type
  if (
    !normalizedType ||
    (normalizedType !== "manga" && normalizedType !== "chapter")
  ) {
    console.error(
      `Invalid comment badge type: ${type}. Expected "manga" or "chapter" or "App\\Models\\Manga" / "App\\Models\\Chapter".`
    );
    return null;
  }

  const badge = config[normalizedType];

  // This should never happen with the check above, but keeping for safety
  if (!badge) {
    console.error(`Configuration missing for type: ${normalizedType}`);
    return null;
  }

  // Touch handlers for mobile
  const handleTouchStart = () => {
    if (showTooltip) {
      setTooltipVisible(true);
      // Haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    if (showTooltip) {
      setTimeout(() => setTooltipVisible(false), 1500);
    }
  };

  // Keyboard handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && showTooltip) {
      e.preventDefault();
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 1500);
    }
  };

  const handleMouseEnter = () => {
    if (showTooltip) {
      setTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="relative inline-block">
      <span
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white transition-colors",
          badge.color,
          variant === "compact" && "text-[10px] px-1 py-0.5",
          // Focus styles for keyboard navigation
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500/50",
          // Hover effects
          "hover:brightness-110 cursor-default",
          className
        )}
        aria-label={badge.ariaLabel}
        role="badge"
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {badge.label}
      </span>

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-50 pointer-events-none",
            "transition-opacity duration-200",
            tooltipVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {badge.tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
