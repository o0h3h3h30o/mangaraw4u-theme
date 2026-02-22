import { z } from "zod";
import { sanitizeHtml } from "@/lib/utils/sanitize";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "comment.errors.contentRequired")
    .max(2000, "comment.errors.contentTooLong")
    .transform((content) => sanitizeHtml(content)),
  parent_id: z.number().nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
