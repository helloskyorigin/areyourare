import { NextResponse } from 'next/server';
import { checkoutReady } from '@/lib/payments';
export const runtime='nodejs';
export async function GET(){
  return NextResponse.json({
    status:'ok',
    product:'AREYOURARE',
    experience:'birthday-history-v2',
    source:'Wikipedia On This Day',
    checkoutAvailable:checkoutReady(),
    mode:process.env.DODO_MODE==='live_mode'?'live':'test',
    timestamp:new Date().toISOString(),
  },{headers:{'Cache-Control':'no-store'}});
}
