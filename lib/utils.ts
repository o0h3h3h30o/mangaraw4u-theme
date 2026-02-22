import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number for display
 * Converts large numbers to K/M format for better readability
 *
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M")
 *
 * @example
 * formatNumber(1234) // "1.2K"
 * formatNumber(1234567) // "1.2M"
 * formatNumber(500) // "500"
 */
/**
 * Get time-ago key and count for i18n
 * Returns { key, count } to be used with translations
 */
export function getTimeAgo(date: string | Date): { key: string; count: number } {
  const now = Date.now();
  const past = new Date(date).getTime();
  const diff = Math.max(0, now - past);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return { key: "yearsAgo", count: years };
  if (months > 0) return { key: "monthsAgo", count: months };
  if (days > 0) return { key: "daysAgo", count: days };
  if (hours > 0) return { key: "hoursAgo", count: hours };
  if (minutes > 0) return { key: "minutesAgo", count: minutes };
  return { key: "justNow", count: 0 };
}

/**
 * Convert string to Title Case
 * "A WONDERFUL NEW WORLD" → "A Wonderful New World"
 * "hello world" → "Hello World"
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
