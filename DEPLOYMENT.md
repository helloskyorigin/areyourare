# AREYOURARE V2 — release checklist

**Public website:** https://areyourare.ai.studio

This is a Wikipedia-powered birthday history product with one free discovery and one **$2 USD one-time** paid Time Capsule. Astronomy code remains archived in the repository but is not used by public V2 routes. Google AdSense has been removed.

## Public user journey

1. **/** or **/discover** — enter a valid date of birth (1900 through today).
2. **/searching?date=YYYY-MM-DD** — live Wikimedia On This Day request. No artificial waiting; it moves immediately upon success.
3. **/result?date=YYYY-MM-DD** — first historical story, Wikipedia source links, a notable birthday and two previews, plus a $2 checkout offer. The exact birth year is not misrepresented as an anniversary.
4. **Dodo hosted checkout** — HTTPS, server-created one-time product checkout, not a hardcoded payment link. If checkout is not configured, the purchase button visibly disables.
5. **/payment/return?date=...** — handles successful/failed/pending/cancelled checkout. It polls the server for a real purchase status, then **automatically redirects to /capsule only when Dodo confirms successful payment**.
6. **/capsule?date=...** — premium API is protected server-side, shows full searchable historical collections, a complete print-to-PDF report and a private recovery-link action.
7. **/my-capsules** — lists purchases verified in this browser.
8. **/recover?token=...** — signed, time-limited private recovery link. On redemption the server checks Dodo again and reinstates the relevant HttpOnly access cookie; invalid links redirect to /recover-help.

Private result/payment/capsule/recovery pages are excluded from indexing. The public site has robots.txt and sitemap.xml.

## Dodo account configuration (mandatory, not automated)

From the approved merchant's own **Dodo Payments dashboard**:

1. Create an **approved one-time payment product priced at $2.00 USD**. It must not be a subscription, and the checkout price must be checked for taxes/adaptive pricing and the intended customer markets.
2. Use the actual environment-specific Dodo **product ID** (starts with \`pdt_\`) and the corresponding merchant **API key**. Sandbox and live IDs/keys are distinct. The API key must allow creating checkout sessions and reading payment details.
3. Set these secret environment variables in your deployment service:
   - \`APP_URL=https://areyourare.ai.studio\`
   - \`DODO_MODE=test_mode\` during sandbox; change to \`live_mode\` **only after successful sandbox validation and merchant approval**.
   - \`DODO_PAYMENTS_API_KEY\` — server only.
   - \`DODO_PRODUCT_ID\` — the correct one-time, $2 product for the chosen Dodo environment.
   - \`PURCHASE_COOKIE_SECRET\` — persistent strong random secret, 24+ characters; \`openssl rand -base64 48\` recommended.
4. Check the merchant's payout/settlement account, tax settings, product approval, and legal ownership in Dodo. **Deploying website code does not activate or verify payouts.**
5. Never paste keys into chat, GitHub, or client-side code. Rotate compromised secrets.
6. Redeploy the project after changing environment variables; test the deployed domain.

## Sandbox acceptance tests: must pass before opening live sales

- Valid DOB, invalid DOB, leap-day DOB, and future DOB.
- Wikimedia API normal response, unexpected empty data, transient outage, appropriate source attribution.
- Mobile layout at 320, 360, 375, 390, 768, 1024 and 1440px, dark contrast, no sideways scroll; low bandwidth, reduced-motion.
- GET /api/health -> \`checkoutAvailable\` true when expected. GET /api/checkout-availability -> \`available:true\` and \`testMode:true\` during sandbox.
- $2 Dodo **successful sandbox payment**, session URL redirect, /payment/return polling, automatic premium unlock; directly accessing /api/capsule without payment returns 403.
- Cancelled, failed, processing and delayed payment handling. Query parameter \`status=succeeded\` alone must never grant premium access.
- Wrong product, wrong DOB, wrong checkout session, invalid cookie, replayed/modified recovery token and refunded purchase cannot open premium data.
- Full archive exported to PDF (not only first 12 records or current tab), linked sources legible in print.
- Two different DOB purchases in one browser both remain accessible at /my-capsules (separate signed cookies). Copy private recovery link, redeem in another browser; treat link as a password and never publish it.
- Refund/partial refund reflected in provider details and access revoked by server-side checks. Refund and chargeback support process tested with the merchant.
- Privacy, Terms and Refunds checked for your jurisdiction. No claim of lifetime access; access is currently 180 days from checkout, with limited recovery support.

## Security behavior

- Browser never chooses arbitrary product ID or unlocks by trusting checkout return query params.
- Dodo GET /checkouts/{id} and GET /payments/{payment_id} are both checked. Requires matching session, checkout status succeeded, payment status succeeded, matching product, requested date, metadata, and no partial/full refund.
- Paid API checks entitlement **for every request**. No premium details in free payload.
- The purchase cookie is signed and HttpOnly, SameSite=Lax; one cookie per DOB. Old V2 signed receipts are read for migration.
- Recovery tokens are signed HMAC bearer links minted only after verified purchase, checked against Dodo on redemption, and expire with original receipt (maximum 180 days after checkout). Anyone holding the full private link can use it. This is not a permanent email-based recovery service.
- No durable purchase database, webhooks, dispute state store or account-based self-service email recovery is configured; email support is required if both the browser cookie and recovery link are lost. Dodo status is verified at request time, including refund state.
- Hosted purchase links are single-use; a fresh session is generated per checkout.

## Build / tests

From the repository root:

\`\`\`bash
npm install
npx tsc --noEmit
node --import tsx --test tests/birthday-v2.test.ts tests/payments-v2.test.ts tests/layout-v2.test.mjs tests/launch-v2.test.mjs
npm run build
\`\`\`

The \`test\` scripts mock Dodo and Wikipedia. **They do not prove that live credentials, remote providers, or bank payouts work.** Complete a real Dodo sandbox checkout before live publishing.

## Support

- \`hello.skyorigin@gmail.com\` for receipt/invoice support.
- Do not request sensitive payment-card numbers from users.
- The domain must serve HTTPS; verify correct redirect URL and approved Dodo product before publishing.

### Current integration limitation

Live credentials, legal merchant approval, payout status, domain routing and actual deployed environment cannot be validated from source code alone. No production sales should begin until these external steps have been completed and checked. Test-mode is the default for safety.
