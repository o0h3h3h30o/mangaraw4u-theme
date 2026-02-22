"use client";

/**
 * Star Rating Component
 * Interactive star rating component with hover preview and touch support
 */

import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  disabled = false,
  isLoading = false,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const t = useTranslations("rating");
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Ensure value is always a valid number
  const numericValue =
    typeof value === "number" ? value : parseFloat(String(value)) || 0;

  const handleMouseEnter = useCallback(
    (starValue: number) => {
      if (!readonly && !disabled && !isLoading) {
        setHoverValue(starValue);
      }
    },
    [readonly, disabled, isLoading]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const handleClick = useCallback(
    (starValue: number) => {
      if (!readonly && !disabled && !isLoading && onChange) {
        // Validate rating value (1-5 range)
        if (starValue < 1 || starValue > 5) {
          console.error("Invalid rating value:", starValue);
          return;
        }
        onChange(starValue);
      }
    },
    [readonly, disabled, isLoading, onChange]
  );

  const displayValue = hoverValue ?? numericValue;
  const isInteractive = !readonly && !disabled && !isLoading;

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        isInteractive && "cursor-pointer",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      role="group"
      aria-label={t("starRatingLabel")}
      aria-busy={isLoading}
      aria-live="polite"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            disabled={!isInteractive}
            className={cn(
              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              isInteractive && "hover:scale-110",
              !isInteractive && "cursor-default"
            )}
            aria-label={t("rateStarsLabel", { value: starValue })}
            tabIndex={isInteractive ? 0 : -1}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}

      {showValue && numericValue > 0 && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {numericValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}
