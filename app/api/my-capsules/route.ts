import { NextRequest, NextResponse } from 'next/server';
import { readReceipt, statusForReceipt } from '@/lib/payments';
import { parseBirthday } from '@/lib/birthday';
export const runtime='nodejs';
export async function GET(request:NextRequest){
  const names=request.cookies.getAll().map(c=>c.name)
    .filter(name=>/^ayr_purchase_\d{8}$/.test(name)).slice(0,12);
  const dates=[...new Set(names.map(n=>{
    const digits=n.slice('ayr_purchase_'.length);
    return digits.slice(0,4)+'-'+digits.slice(4,6)+'-'+digits.slice(6,8);
  }).filter(d=>parseBirthday(d)!==null))];
  const verified=await Promise.all(dates.map(async date=>{
    const receipt=readReceipt(request,date);
    return receipt&&(await statusForReceipt(receipt,date)).paid?date:null;
  }));
  return NextResponse.json({dates:verified.filter((d):d is string=>Boolean(d))},{
    headers:{'Cache-Control':'private, no-store'}
  });
}
