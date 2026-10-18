import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory } from '@/lib/history';
import { verifiedPurchase } from '@/lib/payments';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const date = parseBirthday(request.nextUrl.searchParams.get('date'));
  if (!date) return NextResponse.json({error:'Invalid birth date.'},{status:400});
  if (!await verifiedPurchase(request, date.iso)) {
    return NextResponse.json({error:'Verified payment required. Open the capsule in the browser used for checkout.'},{status:403,headers:{'Cache-Control':'no-store'}});
  }
  try {
    return NextResponse.json(await loadHistory(date),{headers:{'Cache-Control':'private, no-store'}});
  } catch {
    return NextResponse.json({error:'The archive is temporarily unavailable.'},{status:503});
  }
}
