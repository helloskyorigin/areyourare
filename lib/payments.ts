import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
export const PURCHASE_COOKIE = 'ayr_birthday_purchase';
type Receipt = { sessionId: string; date: string; createdAt: number };
const secret = () => process.env.PURCHASE_COOKIE_SECRET || '';
const baseUrl = () => process.env.DODO_MODE === 'live_mode'
  ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
export const checkoutReady = () => Boolean(secret() && process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PRODUCT_ID);
function signature(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}
export function encodeReceipt(data: Receipt): string {
  if (!secret()) throw new Error('COOKIE_SECRET_MISSING');
  const content = Buffer.from(JSON.stringify(data)).toString('base64url');
  return content + '.' + signature(content);
}
export function readReceipt(req: NextRequest): Receipt | null {
  if (!secret()) return null;
  const raw = req.cookies.get(PURCHASE_COOKIE)?.value;
  const pieces = raw?.split('.') || [];
  if (pieces.length !== 2) return null;
  const [content, mac] = pieces;
  const expected = Buffer.from(signature(content)), provided = Buffer.from(mac);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const data = JSON.parse(Buffer.from(content,'base64url').toString('utf8')) as Receipt;
    if (!/^cks_[a-zA-Z0-9_-]+$/.test(data.sessionId) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      !Number.isFinite(data.createdAt) || data.createdAt > Date.now() + 60000 ||
      Date.now() - data.createdAt > 180 * 86400000) return null;
    return data;
  } catch { return null; }
}
async function dodo(path: string, init?: RequestInit) {
  const response = await fetch(baseUrl() + path, {
    ...init, cache: 'no-store', signal: AbortSignal.timeout(12000),
    headers: { Authorization: 'Bearer ' + (process.env.DODO_PAYMENTS_API_KEY || ''),
      'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error('PAYMENT_PROVIDER_' + response.status);
  return response.json();
}
export async function createCheckout(date: string, origin: string): Promise<{sessionId:string;checkoutUrl:string}> {
  const productId = process.env.DODO_PRODUCT_ID || '';
  if (!/^pdt_[a-zA-Z0-9_-]+$/.test(productId)) throw new Error('INVALID_PRODUCT');
  const result = await dodo('/checkouts', { method: 'POST', body: JSON.stringify({
    product_cart: [{ product_id: productId, quantity: 1 }],
    metadata: { product:'birthday_time_capsule_v2', birthday:date },
    return_url: origin + '/result?date=' + encodeURIComponent(date),
  }) }) as { session_id?: string; checkout_url?: string };
  if (!result.session_id || !/^cks_[a-zA-Z0-9_-]+$/.test(result.session_id) || !result.checkout_url)
    throw new Error('INVALID_CHECKOUT_RESPONSE');
  const checkout = new URL(result.checkout_url);
  if (checkout.protocol !== 'https:' ||
    !(checkout.hostname === 'dodopayments.com' || checkout.hostname.endsWith('.dodopayments.com')))
    throw new Error('INVALID_CHECKOUT_URL');
  return { sessionId: result.session_id, checkoutUrl:checkout.toString() };
}
export async function verifiedPurchase(req: NextRequest, date: string): Promise<boolean> {
  const receipt = readReceipt(req);
  if (!checkoutReady() || !receipt || receipt.date !== date) return false;
  try {
    const checkout = await dodo('/checkouts/' + encodeURIComponent(receipt.sessionId)) as {
      payment_status?: string; payment_id?: string;
    };
    if (checkout.payment_status !== 'succeeded' || !checkout.payment_id ||
      !/^pay_[a-zA-Z0-9_-]+$/.test(checkout.payment_id)) return false;
    const payment = await dodo('/payments/' + encodeURIComponent(checkout.payment_id)) as {
      status?: string; metadata?: Record<string,string>; product_cart?: {product_id?:string}[];
    };
    if (payment.status !== 'succeeded') return false;
    if (payment.metadata?.birthday && payment.metadata.birthday !== date) return false;
    if (payment.metadata?.product && payment.metadata.product !== 'birthday_time_capsule_v2') return false;
    if (Array.isArray(payment.product_cart) &&
      !payment.product_cart.some(item=>item.product_id === process.env.DODO_PRODUCT_ID)) return false;
    return true;
  } catch { return false; }
}
