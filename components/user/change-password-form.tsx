"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdatePassword } from "@/lib/hooks/use-profile";
import { changePasswordSchema } from "@/lib/validators/user-schemas";
import type { z } from "zod";

type FormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChangePasswordForm({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) {
  const t = useTranslations("user.profile.passwordForm");
  const tCommon = useTranslations("common");

  const { updatePassword, isLoading } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await updatePassword(data);

    if (result.success) {
      toast.success(t("success"));
      reset(); // Clear form
      onSuccess?.();
    } else {
      toast.error(t("error"), {
        description: result.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="current_password">{t("currentPassword")}</Label>
            <Input
              id="current_password"
              type="password"
              {...register("current_password")}
              placeholder={t("currentPasswordPlaceholder")}
              disabled={isLoading}
            />
            {errors.current_password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.current_password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={t("newPasswordPlaceholder")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password_confirmation">
              {t("confirmPassword")}
            </Label>
            <Input
              id="password_confirmation"
              type="password"
              {...register("password_confirmation")}
              placeholder={t("confirmPasswordPlaceholder")}
              disabled={isLoading}
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? `${tCommon("loading")}` : t("changePassword")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
