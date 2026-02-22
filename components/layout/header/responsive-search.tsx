"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

import { SearchBar } from "./search-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResponsiveSearchProps {
  className?: string;
}

export function ResponsiveSearch({ className }: ResponsiveSearchProps) {
  const t = useTranslations("search");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Desktop: Always show search bar */}
      <div className={cn("hidden md:flex md:w-80 lg:w-96", className)}>
        <SearchBar className="w-full" />
      </div>

      {/* Mobile: Toggle button */}
      <div className="flex md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label={t("toggleSearch")}
          className="h-10 w-10"
        >
          {isSearchOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile: Slide-down search bar */}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b bg-background/95 backdrop-blur md:hidden">
          <div className="container px-4 py-3">
            <div className="flex items-center gap-2">
              <SearchBar className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                aria-label={t("closeSearch")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
