/**
 * Service for validating and resolving IANA Timezone identifiers
 */

const validTzCache = new Map<string, boolean>();

export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  const cached = validTzCache.get(tz);
  if (cached !== undefined) return cached;

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    validTzCache.set(tz, true);
    return true;
  } catch {
    validTzCache.set(tz, false);
    return false;
  }
}

/**
 * Normalizes timezone string, defaulting to UTC if unavailable/malformed
 */
export function normalizeTimezone(tz?: string): string {
  if (tz && isValidIanaTimezone(tz)) {
    return tz;
  }
  return 'UTC';
}
