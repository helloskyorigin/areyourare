import { NextRequest, NextResponse } from 'next/server';
import { cookieNameForDate, encodeReceipt, readRecoveryToken, remainingCookieSeconds, statusForReceipt } from '@/lib/payments';
export const runtime='nodejs';
export async function GET(request:NextRequest) {
  const raw=request.nextUrl.searchParams.get('token')||'';
  const receipt=readRecoveryToken(raw);
  const failure=new URL('/recover-help',request.nextUrl.origin);
  const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
  if (!receipt) return NextResponse.redirect(failure,{headers});
  const payment=await statusForReceipt(receipt,receipt.date);
  if (!payment.paid) return NextResponse.redirect(failure,{headers});
  const destination=new URL('/capsule',request.nextUrl.origin);
  destination.searchParams.set('date',receipt.date);
  const response=NextResponse.redirect(destination,{headers});
  response.cookies.set(cookieNameForDate(receipt.date),encodeReceipt(receipt),{
    httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',
    path:'/',maxAge:remainingCookieSeconds(receipt),
  });
  return response;
}
