"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";
import { User, Library, Settings, LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useLogout();
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success(t("auth.logoutSuccess"));
      router.push("/");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link prefetch={false} href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          {t("common.login")}
        </Link>
      </Button>
    );
  }

  // Get user initials for avatar fallback
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_full_url} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {t("user.availablePoints", {
                points: user.available_points ?? 0,
              })}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link prefetch={false} href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {t("navigation.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link prefetch={false} href="/library" className="cursor-pointer">
            <Library className="mr-2 h-4 w-4" />
            {t("navigation.library")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link prefetch={false} href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            {t("navigation.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {t("common.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
