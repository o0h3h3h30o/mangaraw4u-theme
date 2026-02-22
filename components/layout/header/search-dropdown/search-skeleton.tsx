"use client";

/**
 * SearchSkeleton Component
 * Loading state with animated skeleton cards
 */

import { cn } from "@/lib/utils";

export function SearchSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 p-2 border-b last:border-b-0",
            "animate-pulse"
          )}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          {/* Thumbnail skeleton */}
          <div className="flex-shrink-0 w-14 h-20 bg-muted rounded-sm" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-2 pt-1">
            {/* Title skeleton */}
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />

            {/* Chapter skeleton */}
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
