import { NextResponse } from 'next/server';
import { checkoutReady } from '@/lib/payments';
export const runtime = 'nodejs';
export function GET() {
  return NextResponse.json({
    available:checkoutReady(), testMode:process.env.DODO_MODE!=='live_mode',
  },{headers:{'Cache-Control':'private, no-store'}});
}
