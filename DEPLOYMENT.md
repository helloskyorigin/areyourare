# AREYOURARE — V2 Pay-First Release

**Domain:** https://areyourare.ai.studio
**Repository:** helloskyorigin/areyourare

## Production user journey (2026-10-19)

1. **Landing** \`/\` — branded Birthday Time Capsule. No free historical examples/results.
2. **DOB form** \`/discover\` or landing field — user enters birthday. No name, birth time, or birthplace needed.
3. **Short scan** \`/searching?date=YYYY-MM-DD\` — verifies that the historical archive can load; no artificial countdown. The public endpoint \`/api/discover?date=...\` returns only \`{"ready":true}\` or a generic error. Never sends events, dates/years of events, portraits, people, excerpts, or premium counts.
4. **Sealed curiosity screen** \`/unlock?date=YYYY-MM-DD\` — editorial date reveal, generic locked chapters and a **$2 one-time unlock** near the bottom. No factual stories/years/titles are shown; no misleading fabricated content count. Previously paid users automatically continue to their report.
5. **Dodo hosted checkout** — server-created, product-ID-pinned, one-time payment. Secure callback URL \`/payment/return?date=...\`; never trust \`?status=success\` or any browser-only payment claim.
6. **Payment return** — verifies checkout + payment with Dodo, handles failed/pending/refunded/cancelled states and redirects after success to **\`/result?date=...\`**.
7. **Paid result** \`/result?date=...\` — full Birthday Time Capsule. The companion legacy \`/capsule\` route still works for existing bookmarks. Both request \`/api/capsule\`; every request is gated by Dodo-verified payment. Historical chronology, notable people, source links and full printable report are paid-only.
8. **\`/my-capsules\`** — date-scoped verified purchases in this browser.
9. **\`/recover\`** — HMAC-signed private recovery link, validated against live provider purchase status; links expire no later than 180 days after purchase.

## Language

- Default English, optional Hindi via header toggle, preserved across navigation.
- UI copy is bilingual throughout current customer-facing screens, checkout return, accountless reports and legal pages.
- Historical titles and descriptions are automatically translated on the server for **paid Hindi reports** when \`GOOGLE_CLOUD_TRANSLATE_API_KEY\` is configured. This is a separate billed Google Cloud Translation Basic API account. It must be enabled and quota-limited on the server. **Do not** expose the key via \`NEXT_PUBLIC_\`.
- If the key is absent, Hindi paid historical content returns a clear error instead of presenting untranslated results as Hindi. Ensure Hindi works before advertising Hindi availability.
- The Dodo-hosted checkout page's language is controlled by Dodo, not this app.

## Server environment

\`\`\`dotenv
APP_URL=https://areyourare.ai.studio
DODO_MODE=test_mode
DODO_PAYMENTS_API_KEY=<your server-only sandbox key>
DODO_PRODUCT_ID=<approved $2 one-time product ID for this environment>
PURCHASE_COOKIE_SECRET=<stable, secure signing secret, >=24 chars>
GOOGLE_CLOUD_TRANSLATE_API_KEY=<server-only key for Hindi reports>
\`\`\`

Do not put production secrets in GitHub, chat or client-side bundles. Sandbox keys and live keys/product IDs differ.

## Mandatory launch acceptance

- Run CI: strict TypeScript, birthday history and paywall integration tests, responsive regression tests, Dodo payment-security tests and production build.
- In a deployed sandbox with correct credentials: test successful payment, redirect to \`/result\`, full paid report, cancellation, failure, delayed confirmation, refund, multiple DOB purchases and private recovery.
- Test the public \`/api/discover\` payload. It must **never** reveal any historical content or paid summaries. \`/api/capsule\` must return 403 without validated entitlement, including if the user forges browser query strings or cookies.
- Test 320px, 360px, 375px, 390px, tablet and desktop layouts, both language modes, keyboard navigation and reduced-motion.
- Test server-side Hindi translation and complete printable PDF; verify cost and text quality.
- Confirm Dodo's actual $2 product price and taxes/currency display in your merchant dashboard. Verify production payouts, business identity, legal requirements, return URL and approved payment status. Payment code alone does not establish merchant readiness.
- Marketing does not describe the experience as “Wikipedia-powered”; original source article links and licensing/attribution remain where applicable. Do not imply AREYOURARE owns third-party historical material.
- No durable purchase DB, webhook ingestion or account-based email recovery is configured. Keep this limitation in mind before scaling.

**Code pushed does not mean deployed or real-payment tested.** Release only after live hosting and sandbox acceptance checks.
