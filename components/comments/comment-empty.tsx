import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

export function CommentEmpty() {
  const t = useTranslations("comment");

  return (
    <div
      className="flex flex-col items-center justify-center py-8 text-center"
      data-testid="comment-empty"
    >
      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">{t("empty")}</p>
      <p className="text-xs text-muted-foreground mt-1">{t("emptyHint")}</p>
    </div>
  );
}
