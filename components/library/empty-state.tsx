"use client";

import Link from "next/link";
import { BookOpen, Bookmark, History, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "continue" | "bookmarks" | "history";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: LucideIcon; iconColor: string }
> = {
  continue: {
    icon: BookOpen,
    iconColor: "text-blue-500",
  },
  bookmarks: {
    icon: Bookmark,
    iconColor: "text-amber-500",
  },
  history: {
    icon: History,
    iconColor: "text-purple-500",
  },
};

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4",
          config.iconColor
        )}
        aria-hidden="true"
      >
        <Icon className="h-8 w-8" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {/* CTA Button */}
      {actionLabel && actionHref && (
        <Button asChild>
          <Link prefetch={false} href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
