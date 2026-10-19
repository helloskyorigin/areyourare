import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { createRecoveryToken, readReceipt, verifiedPurchase } from '@/lib/payments';
export const runtime='nodejs';
export async function GET(request:NextRequest) {
  const date=parseBirthday(request.nextUrl.searchParams.get('date'));
  if (!date) return NextResponse.json({error:'Invalid birthday.'},{status:400});
  if (!await verifiedPurchase(request,date.iso))
    return NextResponse.json({error:'A verified purchase is required.'},{status:403});
  const receipt=readReceipt(request,date.iso);
  if (!receipt) return NextResponse.json({error:'Purchase session unavailable.'},{status:403});
  const url=new URL('/recover',request.nextUrl.origin);
  url.searchParams.set('token',createRecoveryToken(receipt));
  return NextResponse.json({recoveryUrl:url.toString()},{headers:{
    'Cache-Control':'private, no-store',
    'Referrer-Policy':'no-referrer'
  }});
}
