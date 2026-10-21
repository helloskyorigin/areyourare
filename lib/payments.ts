import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const PURCHASE_COOKIE = 'ayr_birthday_purchase'; // Backward compatibility for V2 launch receipts.
export const COOKIE_DAYS = 180;
const COOKIE_LIFETIME = COOKIE_DAYS * 86400;
const EXPIRY_MS = COOKIE_LIFETIME * 1000;
// productId is embedded in a server-signed cookie when the checkout is created.
// Older receipts without productId continue to require a provider-supplied product cart.
export type Receipt = { sessionId: string; date: string; createdAt: number; productId?: string };
export type PurchaseState = 'paid' | 'pending' | 'failed' | 'cancelled' | 'not_started' | 'unavailable' | 'misconfigured' | 'refunded';
export type PurchaseStatus = { state: PurchaseState; paid: boolean };

const cookieSecret = () => process.env.PURCHASE_COOKIE_SECRET || '';
const validDodoMode = () => process.env.DODO_MODE === 'live_mode' || process.env.DODO_MODE === 'test_mode';
const baseUrl = () => {
  if (!validDodoMode()) throw new Error('DODO_MODE_NOT_CONFIGURED');
  return process.env.DODO_MODE === 'live_mode'
    ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
};
const isSessionId = (v: unknown): v is string => typeof v === 'string' && /^cks_[A-Za-z0-9_-]{6,120}$/.test(v);
const isPaymentId = (v: unknown): v is string => typeof v === 'string' && /^pay_[A-Za-z0-9_-]{6,120}$/.test(v);
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function cookieNameForDate(date: string): string {
  return 'ayr_purchase_' + date.replaceAll('-', '');
}
export function checkoutReady(): boolean {
  // Never silently use Dodo sandbox because a production mode variable is missing/typoed.
  return validDodoMode() && cookieSecret().length >= 24 &&
    Boolean(process.env.DODO_PAYMENTS_API_KEY) &&
    /^pdt_[A-Za-z0-9_-]+$/.test(process.env.DODO_PRODUCT_ID || '');
}
function signature(value: string): string {
  return createHmac('sha256', cookieSecret()).update(value).digest('base64url');
}
function equalSignatures(a: string, b: string): boolean {
  const expected = Buffer.from(a);
  const supplied = Buffer.from(b);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
function signPayload(value: unknown): string {
  if (!cookieSecret()) throw new Error('COOKIE_SECRET_MISSING');
  const body = Buffer.from(JSON.stringify(value)).toString('base64url');
  return body + '.' + signature(body);
}
function parseSigned<T>(value: string | undefined): T | null {
  if (!cookieSecret() || !value || value.length > 1600) return null;
  const parts = value.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1] || !equalSignatures(signature(parts[0]), parts[1])) return null;
  try {
    return JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as T;
  } catch { return null; }
}
function isValidReceipt(value: Receipt | null): value is Receipt {
  return Boolean(value && isSessionId(value.sessionId) && isDate(value.date) &&
    Number.isSafeInteger(value.createdAt) && value.createdAt <= Date.now() + 60000 &&
    value.createdAt > Date.now() - EXPIRY_MS &&
    (value.productId === undefined || /^pdt_[A-Za-z0-9_-]+$/.test(value.productId)));
}
export function encodeReceipt(data: Receipt): string {
  if (!isValidReceipt(data)) throw new Error('INVALID_RECEIPT');
  return signPayload(data);
}
export function readReceipt(request: NextRequest, date: string): Receipt | null {
  // One independently signed cookie per purchased DOB means a second purchase cannot
  // silently destroy an earlier entitlement. Legacy cookie is accepted during migration.
  for (const name of [cookieNameForDate(date), PURCHASE_COOKIE]) {
    const data = parseSigned<Receipt>(request.cookies.get(name)?.value);
    if (isValidReceipt(data) && data.date === date) return data;
  }
  return null;
}
export function remainingCookieSeconds(receipt: Receipt): number {
  return Math.max(0, Math.ceil((receipt.createdAt + EXPIRY_MS - Date.now()) / 1000));
}

// Bearer links must be generated only after a successful provider-side payment check.
// A URL token never bypasses verification; Dodo is checked again on redemption.
type RecoveryData = Receipt & { purpose: 'recover'; issuedAt: number };
export function createRecoveryToken(receipt: Receipt): string {
  if (!isValidReceipt(receipt)) throw new Error('INVALID_RECEIPT');
  return signPayload({ ...receipt, purpose: 'recover', issuedAt: Date.now() } satisfies RecoveryData);
}
export function readRecoveryToken(raw: string): Receipt | null {
  const value = parseSigned<RecoveryData>(raw);
  if (!value || value.purpose !== 'recover' || !isValidReceipt(value) ||
      !Number.isSafeInteger(value.issuedAt) || value.issuedAt < value.createdAt ||
      value.issuedAt > Date.now() + 60000) return null;
  return { sessionId:value.sessionId, date:value.date, createdAt:value.createdAt, ...(value.productId ? {productId:value.productId} : {}) };
}

async function dodo(path: string, init?: RequestInit): Promise<unknown> {
  if (!checkoutReady()) throw new Error('PAYMENTS_NOT_CONFIGURED');
  const response = await fetch(baseUrl() + path, {
    ...init, cache:'no-store', signal:AbortSignal.timeout(12000),
    headers:{ Authorization:'Bearer ' + process.env.DODO_PAYMENTS_API_KEY,
      'Content-Type':'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error('PROVIDER_HTTP_' + response.status);
  return response.json();
}

export async function createCheckout(date: string, siteOrigin: string): Promise<{ sessionId: string; checkoutUrl: string }> {
  if (!isDate(date) || !checkoutReady()) throw new Error('INVALID_CHECKOUT_CONFIGURATION');
  const result = await dodo('/checkouts', {
    method:'POST',
    body:JSON.stringify({
      product_cart:[{product_id:process.env.DODO_PRODUCT_ID,quantity:1}],
      metadata:{product:'birthday_time_capsule_v2',birthday:date},
      return_url:siteOrigin + '/payment/return?date=' + encodeURIComponent(date),
      cancel_url:siteOrigin + '/unlock?date=' + encodeURIComponent(date),
    }),
  }) as { session_id?: unknown; checkout_url?: unknown };
  if (!isSessionId(result.session_id) || typeof result.checkout_url !== 'string')
    throw new Error('INVALID_CHECKOUT_RESPONSE');
  const checkoutUrl = new URL(result.checkout_url);
  if (checkoutUrl.protocol !== 'https:' ||
      !(checkoutUrl.hostname === 'dodopayments.com' || checkoutUrl.hostname.endsWith('.dodopayments.com')))
    throw new Error('INVALID_CHECKOUT_URL');
  return { sessionId:result.session_id, checkoutUrl:checkoutUrl.toString() };
}
type CheckoutResponse = { id?: unknown; payment_id?: unknown; payment_status?: unknown };
type PaymentResponse = {
  status?: unknown; payment_id?: unknown; metadata?: Record<string, unknown> | null;
  product_cart?: { product_id?: string; quantity?: number }[] | null;
  checkout_session_id?: unknown; refund_status?: unknown;
  refunds?: {status?:string}[] | null;
  disputes?: unknown[] | null;
};
export async function statusForReceipt(receipt: Receipt, date: string): Promise<PurchaseStatus> {
  if (!checkoutReady()) return {state:'misconfigured',paid:false};
  if (!isValidReceipt(receipt) || receipt.date !== date) return {state:'not_started',paid:false};
  try {
    const checkout = await dodo('/checkouts/' + encodeURIComponent(receipt.sessionId)) as CheckoutResponse;
    if (checkout.id !== receipt.sessionId) return {state:'unavailable',paid:false};
    if (checkout.payment_status === 'failed') return {state:'failed',paid:false};
    if (checkout.payment_status === 'cancelled') return {state:'cancelled',paid:false};
    if (checkout.payment_status !== 'succeeded' || !isPaymentId(checkout.payment_id))
      return {state:'pending',paid:false};
    const payment = await dodo('/payments/' + encodeURIComponent(checkout.payment_id)) as PaymentResponse;
    if (payment.status !== 'succeeded') return {state:'pending',paid:false};
    if (payment.payment_id !== undefined && payment.payment_id !== checkout.payment_id)
      return {state:'unavailable',paid:false};
    // A refunded purchase cannot continue to unlock the report.
    if (payment.refund_status === 'full' || payment.refund_status === 'partial' ||
        payment.refunds?.some(refund => refund.status === 'succeeded'))
      return {state:'refunded',paid:false};
    // All identifiers and purchase metadata must agree. A URL query is NEVER proof.
    if (payment.checkout_session_id !== receipt.sessionId ||
        payment.metadata?.product !== 'birthday_time_capsule_v2' ||
        payment.metadata?.birthday !== date ||
        (receipt.productId !== undefined && receipt.productId !== process.env.DODO_PRODUCT_ID)) {
      return {state:'unavailable',paid:false};
    }
    // Dodo's Payment.product_cart is optional in the official response schema.
    // If present, it MUST be a single item for our pinned product. If Dodo omits
    // it, rely on the server-signed productId on the original checkout receipt.
    // Never grant a legacy receipt without product_cart this fallback.
    const cart = payment.product_cart;
    if (cart != null) {
      if (!Array.isArray(cart) || cart.length !== 1 ||
          cart[0]?.product_id !== process.env.DODO_PRODUCT_ID || cart[0]?.quantity !== 1)
        return {state:'unavailable',paid:false};
    } else if (receipt.productId !== process.env.DODO_PRODUCT_ID) {
      return {state:'unavailable',paid:false};
    }
    return {state:'paid',paid:true};
  } catch {
    return {state:'unavailable',paid:false};
  }
}
export async function purchaseStatus(request: NextRequest, date: string): Promise<PurchaseStatus> {
  if (!checkoutReady()) return {state:'misconfigured',paid:false};
  const receipt = readReceipt(request,date);
  if (!receipt) return {state:'not_started',paid:false};
  return statusForReceipt(receipt,date);
}
export async function verifiedPurchase(request: NextRequest, date: string): Promise<boolean> {
  return (await purchaseStatus(request,date)).paid;
}
