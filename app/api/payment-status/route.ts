import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { purchaseStatus } from '@/lib/payments';
export const runtime='nodejs';
export async function GET(request:NextRequest) {
  const date=parseBirthday(request.nextUrl.searchParams.get('date'));
  if (!date) return NextResponse.json({paid:false,state:'not_started'}, {status:400});
  const result=await purchaseStatus(request,date.iso);
  return NextResponse.json(result,{headers:{
    'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff',
  }});
}
