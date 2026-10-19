import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory } from '@/lib/history';
import { verifiedPurchase } from '@/lib/payments';
import { apiLanguage, hindiTranslationReady, localizePremium } from '@/lib/i18n-history';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const lang=apiLanguage(request.nextUrl.searchParams.get('lang'));
 const date=parseBirthday(request.nextUrl.searchParams.get('date'));
 if(!date)return NextResponse.json({error:lang==='hi'?'जन्मतिथि सही नहीं है।':'Invalid birth date.'},{status:400});
 if(!await verifiedPurchase(request,date.iso))
  return NextResponse.json({error:lang==='hi'?'प्रीमियम रिपोर्ट खोलने के लिए सत्यापित भुगतान ज़रूरी है।':'Verified payment is required.'},{status:403,headers:{'Cache-Control':'no-store'}});
 if(lang==='hi'&&!hindiTranslationReady())return NextResponse.json({
  error:'हिंदी रिपोर्ट अभी उपलब्ध नहीं है।',
  code:'HINDI_TRANSLATION_NOT_CONFIGURED',
 },{status:503});
 try{
  const history=await loadHistory(date);
  return NextResponse.json(await localizePremium(history,lang),{headers:{'Cache-Control':'private, no-store'}});
 }catch{
  return NextResponse.json({error:lang==='hi'?'रिपोर्ट अभी नहीं मिल पा रही है।':'Historical archive unavailable. Please retry.'},{status:503});
 }
}
