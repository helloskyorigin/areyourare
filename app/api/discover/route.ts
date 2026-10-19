import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory } from '@/lib/history';

export const runtime = 'nodejs';

/** Pre-purchase endpoint returns only successful eligibility.
 * Never include event names, years, people, counts, excerpts or source links.
 * All storytelling content is available exclusively at /api/capsule after verified payment.
 */
export async function GET(request: NextRequest) {
  const date = parseBirthday(request.nextUrl.searchParams.get('date'));
  const hi = request.nextUrl.searchParams.get('lang') === 'hi';
  if (!date) {
    return NextResponse.json({error: hi ? 'सही जन्मतिथि चुनें।' : 'Choose a valid date of birth.'},
      {status:400,headers:{'Cache-Control':'private, no-store'}});
  }
  try {
    await loadHistory(date);
    return NextResponse.json({ready:true},{
      headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'},
    });
  } catch {
    return NextResponse.json({ready:false,error:hi?
      'इस तारीख का इतिहास अभी नहीं खुल पा रहा। कृपया फिर कोशिश करें।':
      'This date could not be checked right now. Please try again.'},{
      status:503,headers:{'Cache-Control':'private, no-store'},
    });
  }
}
