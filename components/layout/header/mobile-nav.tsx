"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import {
  Menu,
  Home,
  Flame,
  Clock,
  Library,
  User,
  Settings,
  LogOut,
  LogIn,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { genreApi } from "@/lib/api/endpoints/manga";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { logout } = useLogout();
  const router = useRouter();
  const t = useTranslations();

  // Fetch genres for the mobile nav
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["genres-mobile-nav", { per_page: 500 }],
    queryFn: () => genreApi.getList({ per_page: 500 }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const genres = genresData?.data || [];

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success(t("auth.logoutSuccess"));
      setOpen(false);
      router.push("/");
    }
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const navLinks = [
    { href: "/", label: t("navigation.home"), icon: Home },
    { href: "/browse?sort=-views", label: t("navigation.hot"), icon: Flame },
    { href: "/browse", label: t("navigation.recent"), icon: Clock },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("navigation.mangaList")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 sm:w-[400px]">
        <SheetTitle className="sr-only">{t("navigation.mangaList")}</SheetTitle>

        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src="/mobile-nav.jpg"
            alt="Navigation Header"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
        </div>

        <div className="flex flex-col space-y-4 p-6">
          {/* User Info Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 rounded-lg border p-3 shadow-sm">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={user.avatar_full_url} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs font-medium text-primary">
                  {t("user.availablePoints", {
                    points: user.available_points ?? 0,
                  })}
                </p>
              </div>
            </div>
          ) : (
            <Button asChild className="w-full shadow-sm">
              <Link href="/login" onClick={() => setOpen(false)}>
                <LogIn className="mr-2 h-4 w-4" />
                {t("common.login")}
              </Link>
            </Button>
          )}

          <Separator />

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Genres Section */}
          <div className="space-y-2">
            <h3 className="px-3 text-sm font-semibold text-muted-foreground">
              {t("navigation.allGenres")}
            </h3>

            {isLoadingGenres ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : genres.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/browse?genre=${genre.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="truncate font-medium">{genre.name}</span>
                      {genre.mangas_count !== undefined &&
                        genre.mangas_count > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {genre.mangas_count}
                          </span>
                        )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t("manga.noResults")}
              </p>
            )}
          </div>

          {/* User Actions (if authenticated) */}
          {isAuthenticated && (
            <>
              <Separator />
              <nav className="flex flex-col space-y-1">
                <Link
                  href="/library"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Library className="h-4 w-4 text-muted-foreground" />
                  <span>{t("navigation.library")}</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{t("navigation.profile")}</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>{t("navigation.settings")}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </button>
              </nav>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
