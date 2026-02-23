"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/hooks/use-auth";
import { useUploadAvatar } from "@/lib/hooks/use-profile";
import { EditProfileForm } from "@/components/user/edit-profile-form";
import { ChangePasswordForm } from "@/components/user/change-password-form";
import { AvatarUpload } from "@/components/user/avatar-upload";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function EditProfilePageClient() {
  const t = useTranslations("user.profile");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    uploadAvatar,
    isLoading: avatarLoading,
    error: avatarError,
  } = useUploadAvatar();

  // Use useEffect for redirect to avoid SSR issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag on mount
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect on client side after component mounts
    if (isClient && (!isAuthenticated || !user)) {
      router.push("/login");
    }
  }, [isClient, isAuthenticated, user, router]);

  // Show loading during SSR or while checking auth
  if (!isClient || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Handle password change success - show toast and clear form
  const handlePasswordSuccess = () => {
    // Form already cleared in component
    toast.success(t("passwordForm.success"));
  };

  // Handle avatar upload with error handling
  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar(file);
    if (result.success) {
      toast.success(t("editForm.success"));
    } else {
      toast.error(t("editForm.avatarUploadError"), {
        description: result.error,
      });
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link prefetch={false} href="/profile">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToProfile")}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{t("editProfile")}</h1>
        <p className="text-muted-foreground">{t("accountSettings")}</p>
      </div>

      <Separator />

      {/* Avatar Upload Section */}
      <AvatarUpload
        currentAvatar={user.avatar_full_url}
        onUpload={handleAvatarUpload}
        isLoading={avatarLoading}
        error={avatarError}
      />

      {/* Profile Info (readonly) */}
      <EditProfileForm user={user} />

      <Separator />

      {/* Password Change Form */}
      <ChangePasswordForm
        onSuccess={handlePasswordSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
