import { DiscoverRequest } from '../types/birth-input';
import { normalizeLocation } from '../services/location';

export interface ValidationResult {
  isValid: boolean;
  sanitized?: DiscoverRequest;
  error?: {
    code: 'INVALID_INPUT' | 'MALFORMED_REQUEST' | 'LOCATION_RESOLUTION_FAILED';
    message: string;
  };
}

export function validateBirthDate(dateStr: string): { isValid: boolean; error?: string } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, error: 'Birth date is required.' };
  }

  // Expect YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return { isValid: false, error: 'Birth date must be in YYYY-MM-DD format.' };
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { isValid: false, error: 'Birth date contains invalid numbers.' };
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return { isValid: false, error: `Birth year must be between 1900 and ${currentYear}.` };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Birth month must be between 01 and 12.' };
  }

  // Days in month validation (accounting for leap year)
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day < 1 || day > daysInMonth[month - 1]) {
    return { isValid: false, error: `Invalid day for month ${monthStr} in year ${yearStr}.` };
  }

  const parsedDate = new Date(year, month - 1, day);
  const now = new Date();
  if (parsedDate > now) {
    return { isValid: false, error: 'Birth date cannot be in the future.' };
  }

  return { isValid: true };
}

export function validateBirthTime(timeStr: string): { isValid: boolean; error?: string } {
  if (!timeStr || typeof timeStr !== 'string') {
    return { isValid: false, error: 'Birth time is required.' };
  }

  // Expect HH:mm (24-hour format)
  const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!regex.test(timeStr)) {
    return { isValid: false, error: 'Birth time must be a valid 24-hour time in HH:mm format (00:00 to 23:59).' };
  }

  return { isValid: true };
}

export function validateDiscoverPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'Request body must be a valid JSON object.',
      },
    };
  }

  const payload = body as Partial<DiscoverRequest>;
  const mode = payload.calculation_mode === 'DATE_ONLY' ? 'DATE_ONLY' : 'FULL_TIME';

  // 1. Validate Date
  if (!payload.birthDate) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Birth date (birthDate) is required.',
      },
    };
  }
  const dateValidation = validateBirthDate(payload.birthDate);
  if (!dateValidation.isValid) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_INPUT',
        message: dateValidation.error || 'Invalid birth date.',
      },
    };
  }

  // 2. Validate Time (only required in FULL_TIME mode)
  let sanitizedBirthTime = '';
  if (mode === 'FULL_TIME') {
    if (!payload.birthTime) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Birth time (birthTime) is required in FULL_TIME mode.',
        },
      };
    }
    const timeValidation = validateBirthTime(payload.birthTime);
    if (!timeValidation.isValid) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_INPUT',
          message: timeValidation.error || 'Invalid birth time.',
        },
      };
    }
    sanitizedBirthTime = payload.birthTime.trim();
  }

  // 3. Validate Location
  if (!payload.location) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Birth location (location) is required.',
      },
    };
  }

  const locationRes = normalizeLocation(payload.location);
  if (!locationRes.success || !locationRes.location) {
    return {
      isValid: false,
      error: {
        code: 'LOCATION_RESOLUTION_FAILED',
        message: locationRes.error || 'Unable to resolve birth location coordinates or timezone.',
      },
    };
  }

  return {
    isValid: true,
    sanitized: {
      birthDate: payload.birthDate.trim(),
      birthTime: sanitizedBirthTime,
      location: locationRes.location,
      calculation_mode: mode,
    },
  };
}
