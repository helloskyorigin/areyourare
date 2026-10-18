import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory, freeHistory } from '@/lib/history';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const date = parseBirthday(request.nextUrl.searchParams.get('date'));
  if (!date) return NextResponse.json({error:'Enter a valid birth date between 1900 and today.'},{status:400});
  try {
    return NextResponse.json(freeHistory(await loadHistory(date)), {
      headers: { 'Cache-Control':'private, max-age=0, must-revalidate', 'X-Content-Type-Options':'nosniff' }
    });
  } catch {
    return NextResponse.json({error:'The history archive is temporarily unavailable. Please try again.'},{status:503});
  }
}
