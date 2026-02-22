import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content);
}

/**
 * Sanitize text content and strip all HTML
 *
 * @param content - The text content to sanitize
 * @returns Plain text with HTML stripped
 */
export function sanitizeText(content: string): string {
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
}
