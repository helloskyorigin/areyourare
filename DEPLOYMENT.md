# OUTLIER V1 — Production Deployment & Runbook

## Overview
OUTLIER is a global consumer web application that identifies statistically unusual geometric patterns in birth charts against a verified baseline reference population ($N = 100,000$).

---

## 1. Environment Configuration

All environment configuration is strictly separated by runtime environment (`development`, `staging`, `production`, `test`). No production keys or secrets are committed to version control.

| Variable | Description | Required in Production | Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment (`production` / `development` / `test`) | Yes | `development` |
| `APP_URL` | Public origin URL used for CORS and canonical links | Yes | Cloud Run host |
| `GEMINI_API_KEY` | Server-side API key for editorial explanation generation | Optional (fallback active) | `""` |
| `RATE_LIMIT_MAX` | Max requests per IP window on sensitive endpoints | No | `30` |
| `RATE_LIMIT_WINDOW_MS` | Sliding window duration in milliseconds | No | `60000` (1 min) |
| `TIMEOUT_AI_MS` | Max execution timeout for AI calls | No | `4000` |
| `TIMEOUT_CALCULATION_MS` | Max execution timeout for astronomical calculations | No | `2000` |

---

## 2. Calculation Versioning & Compatibility Matrix

Every discovery result object emitted by OUTLIER is tagged with explicit version identifiers ensuring complete mathematical reproducibility:

- **Calculation Version**: `1.0.0`
- **Astronomy Engine Version**: `1.0.0`
- **Pattern Engine Version**: `1.0.0`
- **Pattern Registry Version**: `1.0`
- **Reference Dataset Version**: `v1`

### Rollback Procedure
If a dataset or calculation engine update is rolled back:
1. Revert `REFERENCE_POPULATION_V1` in `lib/rarity/dataset.ts`.
2. Update the `versions` object in `lib/config/env.ts`.
3. The server's startup integrity check (`lib/rarity/integrity.ts`) will automatically fail safely if any schema or version mismatch is detected, preventing corrupted calculations from reaching users.

---

## 3. Security Architecture

1. **Rate Limiting**: Sliding-window rate limiter per client IP protecting `/api/discover`. Exceeded limits return HTTP 429 with `Retry-After` headers.
2. **Abuse Protection**: Maximum payload size restricted to 10 KB; string length limits enforced across all inputs; malformed JSON rejected with HTTP 400.
3. **CORS & Origin Validation**: Permitted origins strictly validated in production against `APP_URL` and authorized GCP domains.
4. **HTTP Security Headers**: Configured across all routes:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
   - `X-Frame-Options: SAMEORIGIN`
   - `Strict-Transport-Security` (in production HTTPS)

---

## 4. Privacy Guarantees (V1)

- **Zero PII Collection**: OUTLIER does not collect names, email addresses, accounts, phone numbers, or social profiles.
- **Zero Persistent Birth Storage**: User birth details exist only in memory during the request lifecycle and in the user's local `sessionStorage`.
- **Sanitized Logging**: Production logs strip all birth dates, birth times, coordinates, and AI prompt strings. Only random `requestId` values and technical status codes are emitted.
- **Privacy-Safe Share Cards**: Default share assets intentionally omit private birth locations and timestamps, focusing solely on the discovered percentile and pattern name.

---

## 5. Health & Observability Endpoints

- `GET /api/health` — Lightweight liveness check returning uptime and status.
- `GET /api/health?ready=true` — Deep readiness probe validating dataset integrity, pattern registry alignment, and engine health.

---

## 6. Build & Test Commands

```bash
# Linting
npm run lint

# Production Build
npm run build

# Start Production Server
npm start
```
