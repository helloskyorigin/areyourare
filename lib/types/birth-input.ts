import { BirthChartResult } from './astronomy';
import { PatternEngineResult } from './patterns';
import { UserRarityResult } from './rarity';
import { CanonicalVerifiedResult } from './result';

export interface BirthLocationInput {
  city: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface DiscoverRequest {
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:mm" (24-hour local time)
  location: BirthLocationInput;
  calculation_mode?: 'FULL_TIME' | 'DATE_ONLY';
}

export interface NormalizedBirthInput {
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:mm"
  location: {
    city: string;
    region?: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  calculation_mode?: 'FULL_TIME' | 'DATE_ONLY';
}

export interface DiscoverResponse {
  success: boolean;
  discoveryId: string;
  birthInput: NormalizedBirthInput;
  chart: BirthChartResult;
  patterns: PatternEngineResult;
  rarity: UserRarityResult;
  result: CanonicalVerifiedResult;
  status: 'ready';
}

export interface ApiErrorResponse {
  error: {
    code:
      | 'INVALID_INPUT'
      | 'LOCATION_RESOLUTION_FAILED'
      | 'ASTRONOMY_CALCULATION_FAILED'
      | 'PATTERN_EVALUATION_FAILED'
      | 'RARITY_CALCULATION_FAILED'
      | 'RATE_LIMIT_EXCEEDED'
      | 'PAYLOAD_TOO_LARGE'
      | 'STRING_LENGTH_EXCEEDED'
      | 'SERVICE_UNAVAILABLE'
      | 'INTERNAL_ERROR'
      | 'MALFORMED_REQUEST';
    message: string;
    details?: Record<string, string>;
  };
}
