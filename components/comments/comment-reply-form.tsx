"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2, X, Smile, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiPickerComponent } from "@/components/ui/emoji-picker";
import { useEmojiInsertion } from "@/hooks/use-emoji-insertion";
import { CaptchaRequiredError } from "@/lib/api/endpoints/manga";
import type { CaptchaChallenge } from "@/types/comment";

interface CommentReplyFormProps {
  onSubmit: (content: string, captcha?: { token: string; answer: string }) => Promise<void>;
  onCancel: () => void;
  replyingTo: string;
}

export function CommentReplyForm({
  onSubmit,
  onCancel,
  replyingTo,
}: CommentReplyFormProps) {
  const t = useTranslations("comment");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { handleEmojiSelect } = useEmojiInsertion(content, setContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    if (captcha && !captchaAnswer.trim()) return;

    setIsSubmitting(true);
    setCaptchaError(false);
    try {
      const captchaData = captcha ? { token: captcha.token, answer: captchaAnswer.trim() } : undefined;
      await onSubmit(content.trim(), captchaData);
      setContent("");
      setCaptcha(null);
      setCaptchaAnswer("");
    } catch (err) {
      if (err instanceof CaptchaRequiredError) {
        setCaptcha(err.captcha);
        setCaptchaAnswer("");
        setCaptchaError(!!captchaAnswer);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleEmojiSelectWithClose = (emoji: string) => {
    handleEmojiSelect(emoji, textareaRef.current);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("replyingTo", { name: replyingTo })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            replyingTo
              ? t("replyPlaceholder", { name: replyingTo })
              : t("placeholder")
          }
          className="min-h-[60px] resize-none text-sm"
          disabled={isSubmitting}
          autoFocus
        />

        {/* Captcha inline */}
        {captcha && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">{captcha.question}</span>
            <Input
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="?"
              className={`w-20 h-7 text-center text-sm ${captchaError ? "border-destructive" : ""}`}
              autoFocus
            />
            {captchaError && (
              <span className="text-xs text-destructive whitespace-nowrap">{t("captchaWrong")}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <EmojiPickerComponent
                  onEmojiSelect={handleEmojiSelectWithClose}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">
              {t("submitHint")}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting || (!!captcha && !captchaAnswer.trim())}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  {t("reply")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
