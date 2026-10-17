import { validateDiscoverPayload } from '../birth-input';

export interface TestCaseResult {
  name: string;
  passed: boolean;
  actual?: unknown;
  expected?: string;
  error?: string;
}

export function runDiscoverValidationTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Helper
  const test = (name: string, payload: unknown, shouldPass: boolean, expectedCode?: string) => {
    const res = validateDiscoverPayload(payload);
    const passed = shouldPass ? res.isValid : !res.isValid && (!expectedCode || res.error?.code === expectedCode);
    results.push({
      name,
      passed,
      actual: res.isValid ? 'valid' : res.error?.code,
      expected: shouldPass ? 'valid' : expectedCode,
    });
  };

  // 1. Valid birth input
  test(
    '1. Valid birth input',
    {
      birthDate: '1998-05-21',
      birthTime: '14:30',
      location: {
        city: 'London',
        region: 'Greater London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    true
  );

  // 2. Missing date
  test(
    '2. Missing date',
    {
      birthTime: '14:30',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'INVALID_INPUT'
  );

  // 3. Invalid date (30th February)
  test(
    '3. Invalid date (impossible calendar day)',
    {
      birthDate: '2001-02-30',
      birthTime: '14:30',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'INVALID_INPUT'
  );

  // 4. Missing time
  test(
    '4. Missing time',
    {
      birthDate: '1998-05-21',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'INVALID_INPUT'
  );

  // 5. Invalid time (25:00)
  test(
    '5. Invalid time format',
    {
      birthDate: '1998-05-21',
      birthTime: '25:00',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'INVALID_INPUT'
  );

  // 6. Missing location
  test(
    '6. Missing location',
    {
      birthDate: '1998-05-21',
      birthTime: '14:30',
    },
    false,
    'INVALID_INPUT'
  );

  // 7. Invalid coordinates (latitude 120 > 90)
  test(
    '7. Invalid coordinates (latitude out of bounds)',
    {
      birthDate: '1998-05-21',
      birthTime: '14:30',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 120.5,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'LOCATION_RESOLUTION_FAILED'
  );

  // 8. Invalid timezone
  test(
    '8. Invalid IANA timezone',
    {
      birthDate: '1998-05-21',
      birthTime: '14:30',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Invalid/NonExistent_Zone',
      },
    },
    false,
    'LOCATION_RESOLUTION_FAILED'
  );

  // 9. Successful normalization
  const normPayload = {
    birthDate: '2005-11-04',
    birthTime: '08:15',
    location: {
      city: ' Tokyo ',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
    },
  };
  const normResult = validateDiscoverPayload(normPayload);
  results.push({
    name: '9. Successful normalization',
    passed: normResult.isValid && normResult.sanitized?.location.city === 'Tokyo',
    actual: normResult.sanitized?.location.city,
    expected: 'Tokyo',
  });

  // 10. Location-resolution failure (missing city/country)
  test(
    '10. Location resolution failure (missing required city)',
    {
      birthDate: '1998-05-21',
      birthTime: '14:30',
      location: {
        city: '',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
    false,
    'LOCATION_RESOLUTION_FAILED'
  );

  // 11. Malformed request (not an object)
  test('11. Malformed request (string body)', 'raw string body', false, 'MALFORMED_REQUEST');

  return results;
}
