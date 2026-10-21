import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { checkoutReady, createCheckout, encodeReceipt, cookieNameForDate, COOKIE_DAYS } from '@/lib/payments';
import { isTrustedCheckoutOrigin } from '@/lib/security/checkout-origin';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Safe read-only diagnostics: if this URL returns HTML in the deployed site,
// the Next.js API server was not deployed/routed correctly.
export async function GET() {
  return NextResponse.json({route:'areyourare-checkout',method:'POST',available:checkoutReady(),mode:process.env.DODO_MODE==='live_mode'?'live':'test'},
    {headers:{'Cache-Control':'no-store'}});
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && !isTrustedCheckoutOrigin(origin,request.nextUrl.origin,request.headers,process.env.APP_URL)) {
    return NextResponse.json({error:'Invalid request origin.'},{status:403});
  }
  if (!checkoutReady()) return NextResponse.json({
    error:'Payments are being prepared. Please check back shortly.'
  },{status:503});
  let body:unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({error:'Invalid request.'},{status:400}); }
  const raw = body && typeof body === 'object' && 'date' in body ? (body as {date:unknown}).date : null;
  const date = parseBirthday(raw);
  if (!date) return NextResponse.json({error:'Choose a valid date first.'},{status:400});
  try {
    const configured = process.env.APP_URL;
    // Pin the return origin to the official origin; never accept it from JSON body.
    const siteOrigin = configured && /^https:\/\//.test(configured)
      ? new URL(configured).origin : request.nextUrl.origin;
    if (process.env.NODE_ENV === 'production' && !siteOrigin.startsWith('https://'))
      return NextResponse.json({error:'Secure checkout configuration required.'},{status:503});
    const session = await createCheckout(date.iso,siteOrigin);
    const response = NextResponse.json({checkoutUrl:session.checkoutUrl},{headers:{'Cache-Control':'no-store'}});
    const now=Date.now();
    response.cookies.set(cookieNameForDate(date.iso),encodeReceipt({
      sessionId:session.sessionId,date:date.iso,createdAt:now,
      productId:process.env.DODO_PRODUCT_ID,
    }),{
      httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',
      path:'/',maxAge:COOKIE_DAYS*86400,
    });
    return response;
  } catch (error) {
    // Log only a safe failure category. Never log credentials, request bodies or customers.
    const code=error instanceof Error && /^PROVIDER_HTTP_\d{3}$/.test(error.message)
      ? error.message : 'CHECKOUT_PROVIDER_UNAVAILABLE';
    console.error('[AreYouRare checkout]',code);
    const configurationFailure=['PROVIDER_HTTP_401','PROVIDER_HTTP_403','PROVIDER_HTTP_404'].includes(code);
    return NextResponse.json({
      error:configurationFailure
        ? 'Checkout is temporarily unavailable. Please contact support if this persists.'
        : 'Could not open the payment page. Please try again.',
    },{status:configurationFailure?503:502,headers:{'Cache-Control':'no-store'}});
  }
}
