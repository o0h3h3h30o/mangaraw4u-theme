/**
 * Build query string from params object
 */
export function buildQueryString(params?: unknown): string {
  if (!params) return "";

  // Safely cast to Record to avoid type issues
  const record = params as Record<string, unknown>;

  const searchParams = new URLSearchParams();
  Object.entries(record).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
