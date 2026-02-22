"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReaderSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  zoom: number;
  onZoomChange: (zoom: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  imageSpacing: number;
  onImageSpacingChange: (spacing: number) => void;
  readingDirection?: "ltr" | "rtl";
  onReadingDirectionChange?: (direction: "ltr" | "rtl") => void;
}

const BACKGROUND_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#1a1a1a", label: "Dark" },
  { value: "#2d2d2d", label: "Gray" },
  { value: "#ffffff", label: "White" },
  { value: "#f5f5f5", label: "Light" },
];

export function ReaderSettingsPanel({
  open,
  onOpenChange,
  zoom,
  onZoomChange,
  backgroundColor,
  onBackgroundColorChange,
  imageSpacing,
  onImageSpacingChange,
  readingDirection = "ltr",
  onReadingDirectionChange,
}: ReaderSettingsPanelProps) {
  const t = useTranslations("reader.settings");

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-3/4 sm:w-96 bg-background border-l shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Reading Direction */}
          {onReadingDirectionChange && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t("readingDirection.label")}
              </Label>
              <RadioGroup
                value={readingDirection}
                onValueChange={(value) =>
                  onReadingDirectionChange(value as "ltr" | "rtl")
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="ltr"
                    id="ltr"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="ltr"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-sm font-medium">
                      {t("readingDirection.ltr")}
                    </span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {t("readingDirection.ltrDesc")}
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="rtl"
                    id="rtl"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="rtl"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-sm font-medium">
                      {t("readingDirection.rtl")}
                    </span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {t("readingDirection.rtlDesc")}
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Zoom Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t("zoom.label")}
              </Label>
              <span className="text-sm text-muted-foreground">{zoom}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(value) => onZoomChange(value[0])}
              min={25}
              max={175}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>25%</span>
              <span>100%</span>
              <span>175%</span>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("backgroundColor.label")}
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onBackgroundColorChange(color.value)}
                  className={cn(
                    "h-12 rounded-md border-2 transition-all hover:scale-105",
                    backgroundColor === color.value
                      ? "border-primary ring-primary"
                      : "border-muted"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("backgroundColor.description")}
            </p>
          </div>

          {/* Image Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t("imageSpacing.label")}
              </Label>
              <span className="text-sm text-muted-foreground">
                {imageSpacing}px
              </span>
            </div>
            <Slider
              value={[imageSpacing]}
              onValueChange={(value) => onImageSpacingChange(value[0])}
              min={0}
              max={32}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0px</span>
              <span>16px</span>
              <span>32px</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("imageSpacing.description")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
