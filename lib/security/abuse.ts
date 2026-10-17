export interface AbuseCheckResult {
  passed: boolean;
  code?: 'PAYLOAD_TOO_LARGE' | 'STRING_LENGTH_EXCEEDED' | 'MALFORMED_REQUEST';
  message?: string;
}

const MAX_BODY_BYTES = 10 * 1024; // 10 KB maximum JSON payload size
const MAX_STRING_LENGTH = 150; // Maximum allowed characters for any single text field

/**
 * Validates raw payload size and structure limits against abuse vectors
 */
export function checkAbuseLimits(body: unknown, contentLengthHeader?: string | null): AbuseCheckResult {
  if (contentLengthHeader) {
    const size = parseInt(contentLengthHeader, 10);
    if (!Number.isNaN(size) && size > MAX_BODY_BYTES) {
      return {
        passed: false,
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds maximum allowed size (10 KB).',
      };
    }
  }

  if (!body || typeof body !== 'object') {
    return {
      passed: false,
      code: 'MALFORMED_REQUEST',
      message: 'Request payload must be a valid JSON object.',
    };
  }

  const record = body as Record<string, unknown>;

  // Check top-level strings
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' && val.length > MAX_STRING_LENGTH) {
      return {
        passed: false,
        code: 'STRING_LENGTH_EXCEEDED',
        message: `Field '${key}' exceeds maximum allowed length of ${MAX_STRING_LENGTH} characters.`,
      };
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>;
      for (const [nestedKey, nestedVal] of Object.entries(nested)) {
        if (typeof nestedVal === 'string' && nestedVal.length > MAX_STRING_LENGTH) {
          return {
            passed: false,
            code: 'STRING_LENGTH_EXCEEDED',
            message: `Nested field '${key}.${nestedKey}' exceeds maximum allowed length of ${MAX_STRING_LENGTH} characters.`,
          };
        }
      }
    }
  }

  return { passed: true };
}
