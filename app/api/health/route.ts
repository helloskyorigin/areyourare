import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
 return NextResponse.json({
   status:'ok',
   product:'AREYOURARE',
   experience:'birthday-history-v2',
   source:'Wikipedia On This Day',
   paymentsConfigured:Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PRODUCT_ID && process.env.PURCHASE_COOKIE_SECRET),
   timestamp:new Date().toISOString(),
 },{headers:{'Cache-Control':'no-store'}});
}
