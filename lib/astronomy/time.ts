import { isValidIanaTimezone } from '../services/timezone';

export interface AstronomicalTimeResult {
  localIso: string;
  utcDate: Date;
  utcIso: string;
  julianDay: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    formatterCache.set(timezone, formatter);
  }
  return formatter;
}

/**
 * Converts a UTC Date to Astronomical Julian Day (J2000 standard)
 */
export function dateToJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Converts local civil date (YYYY-MM-DD) and local civil time (HH:mm) in a specific
 * IANA timezone into an exact UTC Date and Julian Day.
 */
export function resolveLocalToUtc(
  localDateStr: string,
  localTimeStr: string,
  timezone: string
): AstronomicalTimeResult {
  if (!isValidIanaTimezone(timezone)) {
    throw new Error(`Invalid or unsupported IANA timezone identifier: "${timezone}"`);
  }

  const [yearStr, monthStr, dayStr] = localDateStr.split('-');
  const [hourStr, minuteStr] = localTimeStr.split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    throw new Error(`Invalid local date or time components: ${localDateStr} ${localTimeStr}`);
  }

  // Create target local ISO representation
  const localIso = `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}T${hourStr.padStart(2, '0')}:${minuteStr.padStart(2, '0')}:00.000`;

  // Start with naive UTC timestamp approximation
  const targetUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Iteratively solve for UTC timestamp that produces exact target local time in timezone
  let guessUtcMs = targetUtcMs;
  for (let iter = 0; iter < 3; iter++) {
    const formatted = getLocalPartsInTimezone(new Date(guessUtcMs), timezone);
    const formattedUtcMs = Date.UTC(
      formatted.year,
      formatted.month - 1,
      formatted.day,
      formatted.hour,
      formatted.minute,
      formatted.second,
      0
    );
    const diffMs = targetUtcMs - formattedUtcMs;
    if (diffMs === 0) break;
    guessUtcMs += diffMs;
  }

  const finalUtcDate = new Date(guessUtcMs);
  const julianDay = dateToJulianDay(finalUtcDate);

  return {
    localIso,
    utcDate: finalUtcDate,
    utcIso: finalUtcDate.toISOString(),
    julianDay,
  };
}

/**
 * Helper to extract local date/time parts in a given IANA timezone
 */
function getLocalPartsInTimezone(
  date: Date,
  timezone: string
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const formatter = getFormatter(timezone);
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  let hour = getPart('hour');
  if (hour === 24) hour = 0; // standard 24h format handling

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour,
    minute: getPart('minute'),
    second: getPart('second'),
  };
}
