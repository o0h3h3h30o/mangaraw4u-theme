"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { avatarFileSchema } from "@/lib/validators/user-schemas";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  isLoading,
  error,
}: AvatarUploadProps) {
  const t = useTranslations("user.profile.editForm");
  const tCommon = useTranslations("common");

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = avatarFileSchema.safeParse(file);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setPreview(null);
    setSelectedFile(null);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("avatarLabel")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Current or preview avatar */}
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border">
            <Image
              src={preview || currentAvatar || "/default-avatar.png"}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {t("avatarDescription")}
            </p>

            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("avatar-input")?.click()}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Button>

              {selectedFile && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                    disabled={isLoading}
                  >
                    {isLoading ? `${tCommon("loading")}` : tCommon("save")}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
