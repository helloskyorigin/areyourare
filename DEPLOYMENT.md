# AREYOURARE V2 — Birthday History Discovery

AREYOURARE has been transformed from an astronomy-based rarity product into a Wikipedia-powered historical birthday experience. Routes in app/ now use lib/history.ts and lib/birthday.ts; older astronomy modules remain in the repository for possible archival reference but are no longer part of the live visitor journey.

## Pages
- / — Midnight Archive landing page with DOB-only discovery form
- /discover — dedicated birthday entry fallback
- /searching?date=YYYY-MM-DD — genuine loading/lookup experience
- /result?date=YYYY-MM-DD — free source-linked discovery and $2 premium offer
- /capsule?date=YYYY-MM-DD — server-verified purchased timeline, birthdays, exact-year matches, searchable archive and print-to-PDF
- /privacy, /terms, /refunds — policy and support pages

## Data
Wikipedia On This Day API: https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/MM/DD. Fallback: https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/MM/DD. No fake events are generated. Historical anniversary dates are month+day across many years, NOT necessarily events in the birth year. Exact birth-year matches are separately displayed and may be empty. Attribution/source links included; check Wikimedia API and media licensing terms. Sources may be outdated or inaccurate.

## Required environment variables
Copy .env.example. Set:
- APP_URL=https://areyourare.ai.studio
- DODO_MODE=test_mode (then live_mode ONLY after sandbox verified)
- DODO_PAYMENTS_API_KEY (server only)
- DODO_PRODUCT_ID (approved $2 one-time AREYOURARE product)
- PURCHASE_COOKIE_SECRET (stable cryptographically random signing secret)

Do not reuse unrelated products or commit credentials. Gateway must approve the product and merchant before live purchase.

## Checkout / access security
POST /api/checkout creates a server-controlled Dodo checkout for the requested birthday. It sets a signed, HttpOnly, SameSite=Lax cookie containing that checkout ID and DOB. On return, GET /api/payment-status checks Dodo's server-side checkout and payment status. GET /api/capsule repeats verification server-side before returning ANY extended archive data. Redirect URL parameters are not proof of payment.

### Known V2 limitation
This initial system does NOT implement account-based recovery, webhook-managed entitlements, durable purchase history, or a refund/chargeback event store. Browser cookie access expires after a maximum of 180 days and starting another checkout may replace the first cookie. Do not claim lifetime access or make live sales until end-to-end Dodo sandbox tests, refund handling, appropriate legal review, and report recovery strategy are considered. Check actual provider response fields against the merchant account and sandbox.

## Validation
Run locally:
  npm install
  npm run build
  node --import tsx --test tests/birthday-v2.test.ts

Test ordinary DOB, 29 February, exact birth-year absent, Wikimedia outages, free endpoint content isolation, Dodo unsuccessful and successful sandbox checkout, and direct premium endpoint bypass attempts. Test 320px, 375px, 768px, 1440px layouts. Use browser print for capsule PDF.

## Privacy
No account or birth location needed for free history searches. Dodo payment metadata associates DOB with checkout. Verify and adjust policies for your legal jurisdiction before launch.
