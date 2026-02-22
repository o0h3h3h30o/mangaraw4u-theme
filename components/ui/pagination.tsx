"use client";

/**
 * Pagination Component
 * Reusable pagination UI with prev/next buttons and page numbers
 * Supports ellipsis for large page counts
 */

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Generate page numbers with ellipsis for large page counts
 * Example: [1, 2, 3, "...", 50] or [1, "...", 5, 6, 7, "...", 50]
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  if (currentPage <= 3) {
    // Near the start: [1, 2, 3, 4, "...", last]
    for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
      pages.push(i);
    }
    if (totalPages > 5) {
      pages.push("ellipsis");
    }
  } else if (currentPage >= totalPages - 2) {
    // Near the end: [1, "...", last-3, last-2, last-1, last]
    pages.push("ellipsis");
    for (let i = Math.max(2, totalPages - 3); i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    // In the middle: [1, "...", current-1, current, current+1, "...", last]
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination component for navigating through pages
 *
 * @param currentPage - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param onPageChange - Callback when page changes
 * @param className - Optional additional CSS classes
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const t = useTranslations("browse.pagination");

  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers(currentPage, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label={t("previous")}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t("previous")}</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={isActive}
              aria-label={t("page", { page })}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-w-[2.5rem]",
                isActive && "pointer-events-none"
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label={t("next")}
        className="gap-1"
      >
        <span className="hidden sm:inline">{t("next")}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
