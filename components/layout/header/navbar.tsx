"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { GenresDropdown } from "./genres-dropdown";
import { ResponsiveSearch } from "./responsive-search";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("navigation");

  // Don't make navbar sticky on chapter reader pages
  const isReaderPage = pathname?.match(/^\/manga\/[^/]+\/[^/]+$/);
  const headerClassName = isReaderPage
    ? "z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    : "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60";

  if (isReaderPage) return null;

  return (
    <header className={headerClassName}>
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Mobile Nav + Logo + Desktop Nav Links */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center">
              <Image
                src="/logo18.png"
                alt="Logo"
                width={144}
                height={40}
                sizes="144px"
                className="rounded-md"
              />
            </Link>

            {/* Desktop Navigation Links - Left side */}
            <nav className="hidden items-center gap-1 md:flex ml-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">{t("home")}</Link>
              </Button>
              <GenresDropdown />
              <Button asChild variant="ghost" size="sm">
                <Link href="/browse?sort=-views">{t("hot")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/browse">{t("recent")}</Link>
              </Button>
            </nav>
          </div>

          {/* Right: Search + Theme Toggle + User Menu */}
          <div className="flex items-center gap-2">
            {/* Responsive Search Bar */}
            <ResponsiveSearch />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
