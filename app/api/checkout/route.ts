import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { checkoutReady, createCheckout, encodeReceipt, PURCHASE_COOKIE } from '@/lib/payments';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({error:'Invalid request origin.'},{status:403});
  }
  if (!checkoutReady()) {
    return NextResponse.json({error:'Checkout is not available yet.'},{status:503});
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({error:'Invalid request.'},{status:400}); }
  const raw = body && typeof body === 'object' && 'date' in body ? (body as {date:unknown}).date : null;
  const date = parseBirthday(raw);
  if (!date) return NextResponse.json({error:'Choose a valid date first.'},{status:400});
  try {
    const configured = process.env.APP_URL;
    const siteOrigin = configured && /^https?:\/\//.test(configured)
      ? new URL(configured).origin : request.nextUrl.origin;
    const session = await createCheckout(date.iso, siteOrigin);
    const response = NextResponse.json({checkoutUrl:session.checkoutUrl},{headers:{'Cache-Control':'no-store'}});
    response.cookies.set(PURCHASE_COOKIE, encodeReceipt({
      sessionId:session.sessionId, date:date.iso, createdAt:Date.now()
    }),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:180*86400});
    return response;
  } catch {
    return NextResponse.json({error:'Could not open checkout. Please try again.'},{status:502});
  }
}
