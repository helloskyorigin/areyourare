import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { checkoutReady, verifiedPurchase } from '@/lib/payments';
export const runtime = 'nodejs';
export async function GET(request:NextRequest) {
  const date = parseBirthday(request.nextUrl.searchParams.get('date'));
  if (!date) return NextResponse.json({paid:false},{status:400});
  const paid = checkoutReady() && await verifiedPurchase(request,date.iso);
  return NextResponse.json({paid,configured:checkoutReady()},{headers:{'Cache-Control':'private, no-store'}});
}
