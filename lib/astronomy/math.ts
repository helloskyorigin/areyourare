const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/**
 * Normalizes any angle into [0, 360) range
 */
export function normalizeDegrees(deg: number): number {
  let normalized = deg % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Calculates shortest arc between two longitudes on a circle [0, 180] degrees.
 * Correctly handles the 0° / 360° boundary.
 * e.g. angularDistance(359, 1) === 2
 */
export function angularDistance(a: number, b: number): number {
  const normA = normalizeDegrees(a);
  const normB = normalizeDegrees(b);
  const diff = Math.abs(normA - normB);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Calculates directional separation from body A to body B [0, 360) degrees moving forward.
 */
export function directionalSeparation(fromDeg: number, toDeg: number): number {
  const normFrom = normalizeDegrees(fromDeg);
  const normTo = normalizeDegrees(toDeg);
  let diff = normTo - normFrom;
  if (diff < 0) {
    diff += 360;
  }
  return diff;
}

/**
 * Formats high-precision decimal longitude to human-readable Zodiac position
 * e.g. 135.25 -> "15° 15' Leo"
 */
export function formatDegreesToZodiac(deg: number): {
  sign: string;
  signDegree: number;
  formatted: string;
} {
  const normalized = normalizeDegrees(deg);
  const signIndex = Math.floor(normalized / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex];
  const signDegree = normalized % 30;

  const degreesInt = Math.floor(signDegree);
  const minutesTotal = (signDegree - degreesInt) * 60;
  const minutesInt = Math.floor(minutesTotal);
  const secondsInt = Math.floor((minutesTotal - minutesInt) * 60);

  const formatted = `${degreesInt}° ${minutesInt.toString().padStart(2, '0')}' ${secondsInt.toString().padStart(2, '0')}'' ${sign}`;

  return {
    sign,
    signDegree,
    formatted,
  };
}

/**
 * Radians to degrees and degrees to radians
 */
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
