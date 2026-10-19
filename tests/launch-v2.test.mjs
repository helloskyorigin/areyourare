import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=(f)=>readFileSync(f,'utf8');

test('published checkout never trusts a query flag as payment authorization',()=>{
 const paid=source('lib/payments.ts');
 const api=source('app/api/capsule/route.ts');
 assert.match(paid,/statusForReceipt/);
 assert.match(paid,/checkout_session_id/);
 assert.match(paid,/refund_status/);
 assert.match(paid,/payment\.product_cart/);
 assert.match(api,/verifiedPurchase/);
});
test('checkout sends users to a dedicated verification route',()=>{
 assert.match(source('lib/payments.ts'),/payment\/return\?date=/);
 assert.match(source('app/payment/return/page.tsx'),/payment-status\?date=/);
 assert.match(source('app/payment/return/page.tsx'),/router\.replace\('\/result/);
});
test('cross-device recovery verifies Dodo again rather than trusting URL tokens',()=>{
 const recovery=source('app/recover/route.ts');
 assert.match(recovery,/readRecoveryToken/);
 assert.match(recovery,/statusForReceipt/);
 assert.match(recovery,/httpOnly:true/);
});
test('multiple purchases have separate cookie names',()=>{
 assert.match(source('app/api/checkout/route.ts'),/cookieNameForDate/);
 assert.match(source('lib/payments.ts'),/ayr_purchase_/);
});
test('whole PDF is available in print mode even when archive pagination is active',()=>{
 const page=source('app/capsule/page.tsx'),css=source('app/launch.css');
 assert.match(page,/capsule-print-report/);
 assert.match(page,/data\.timeline\.map/);
 assert.match(page,/data\.people\.map/);
 assert.match(page,/data\.exactMatches\.map/);
 assert.match(css,/@media print/);
});
test('private pages, including mystery preview, are noindexed and checkout is gated',()=>{
 assert.match(source('app/robots.ts'),/my-capsules/);
 assert.match(source('app/robots.ts'),/unlock/);
 assert.match(source('app/capsule/layout.tsx'),/index:false/);
 assert.match(source('app/payment/return/layout.tsx'),/index:false/);
 assert.match(source('components/v2/PremiumCTA.tsx'),/checkout-availability/);
});
