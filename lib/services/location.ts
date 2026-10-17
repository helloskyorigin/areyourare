import { BirthLocationInput } from '../types/birth-input';
import { isValidIanaTimezone } from './timezone';

export interface LocationResolutionResult {
  success: boolean;
  location?: BirthLocationInput;
  error?: string;
}

/**
 * Normalizes location input and ensures geographical boundaries and timezone validity
 */
export function normalizeLocation(input: Partial<BirthLocationInput>): LocationResolutionResult {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Location data is missing or malformed.' };
  }

  const city = (input.city || '').trim();
  const region = (input.region || '').trim();
  const country = (input.country || '').trim();
  const latitude = typeof input.latitude === 'number' ? input.latitude : parseFloat(String(input.latitude));
  const longitude = typeof input.longitude === 'number' ? input.longitude : parseFloat(String(input.longitude));
  const timezone = (input.timezone || '').trim();

  if (!city) {
    return { success: false, error: 'City is required.' };
  }

  if (!country) {
    return { success: false, error: 'Country is required.' };
  }

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return { success: false, error: 'Latitude must be a valid number between -90 and 90.' };
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return { success: false, error: 'Longitude must be a valid number between -180 and 180.' };
  }

  if (!timezone || !isValidIanaTimezone(timezone)) {
    return { success: false, error: `Invalid IANA timezone identifier: "${timezone}".` };
  }

  return {
    success: true,
    location: {
      city,
      region: region || undefined,
      country,
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      timezone,
    },
  };
}
