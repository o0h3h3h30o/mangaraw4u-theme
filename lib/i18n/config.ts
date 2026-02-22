/**
 * Centralized i18n (internationalization) Configuration
 *
 * This module provides a single source of truth for locale and timezone settings.
 * Values are configurable via environment variables with safe fallback defaults.
 *
 * Environment Variables:
 * - NEXT_PUBLIC_DEFAULT_LOCALE: Default locale (e.g., "vi", "en")
 * - NEXT_PUBLIC_TIMEZONE: IANA timezone identifier (e.g., "Asia/Ho_Chi_Minh")
 *
 * @module lib/i18n/config
 */

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Validates and returns a supported locale
 * Falls back to "vi" if invalid
 */
function getValidatedLocale(): SupportedLocale {
  const envLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

  if (!envLocale) {
    return "en";
  }

  if (SUPPORTED_LOCALES.includes(envLocale as SupportedLocale)) {
    return envLocale as SupportedLocale;
  }

  // Warn in development about invalid locale
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[i18n] Invalid NEXT_PUBLIC_DEFAULT_LOCALE="${envLocale}". ` +
      `Supported locales: ${SUPPORTED_LOCALES.join(", ")}. Falling back to "vi".`
    );
  }

  return "en";
}

/**
 * Validates timezone by testing with Intl.DateTimeFormat
 * Falls back to "Asia/Ho_Chi_Minh" if invalid
 */
function getValidatedTimezone(): string {
  const envTimezone = process.env.NEXT_PUBLIC_TIMEZONE;

  if (!envTimezone) {
    return "Asia/Ho_Chi_Minh";
  }

  try {
    // Test if timezone is valid by creating a DateTimeFormat
    Intl.DateTimeFormat("en-US", { timeZone: envTimezone });
    return envTimezone;
  } catch (error) {
    // Warn in development about invalid timezone
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[i18n] Invalid NEXT_PUBLIC_TIMEZONE="${envTimezone}". ` +
        `Must be a valid IANA timezone identifier. Falling back to "Asia/Ho_Chi_Minh".`
      );
    }
    return "Asia/Ho_Chi_Minh";
  }
}

/**
 * Default locale for the application
 *
 * Reads from NEXT_PUBLIC_DEFAULT_LOCALE environment variable.
 * Falls back to "vi" (Vietnamese) if not set or invalid.
 *
 * @example
 * ```typescript
 * import { DEFAULT_LOCALE } from '@/lib/i18n/config';
 *
 * const locale = DEFAULT_LOCALE; // "vi"
 * ```
 */
export const DEFAULT_LOCALE: SupportedLocale = getValidatedLocale();

/**
 * Timezone for date/time formatting
 *
 * Reads from NEXT_PUBLIC_TIMEZONE environment variable.
 * Falls back to "Asia/Ho_Chi_Minh" if not set or invalid.
 *
 * Uses IANA timezone identifier format.
 *
 * @example
 * ```typescript
 * import { TIMEZONE } from '@/lib/i18n/config';
 *
 * const formatter = new Intl.DateTimeFormat('vi', {
 *   timeZone: TIMEZONE
 * });
 * ```
 */
export const TIMEZONE: string = getValidatedTimezone();

/**
 * Validates if a given locale is supported
 *
 * @param locale - Locale string to validate
 * @returns True if locale is in SUPPORTED_LOCALES
 *
 * @example
 * ```typescript
 * import { isSupportedLocale } from '@/lib/i18n/config';
 *
 * isSupportedLocale('vi'); // true
 * isSupportedLocale('fr'); // false
 * ```
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
