import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory } from '@/lib/history';
import { verifiedPurchase } from '@/lib/payments';
import { apiLanguage, hindiTranslationReady, localizePremium } from '@/lib/i18n-history';

export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};

export async function GET(request:NextRequest){
  const lang=apiLanguage(request.nextUrl.searchParams.get('lang'));
  const date=parseBirthday(request.nextUrl.searchParams.get('date'));
  if(!date)return NextResponse.json({error:lang==='hi'?'जन्मतिथि सही नहीं है।':'Invalid birth date.'},{status:400,headers});
  if(!await verifiedPurchase(request,date.iso))
    return NextResponse.json({error:lang==='hi'?'प्रीमियम रिपोर्ट खोलने के लिए सत्यापित भुगतान ज़रूरी है।':'Verified payment is required.'},{status:403,headers});

  try {
    const history=await loadHistory(date);
    if(lang==='en')return NextResponse.json(history,{headers});
    if(!hindiTranslationReady()){
      // Access never fails after a valid purchase solely because the translation
      // provider isn't configured. The UI discloses that the source text is English.
      return NextResponse.json({
        ...history,translationWarning:'हिंदी अनुवाद अभी उपलब्ध नहीं है। ऐतिहासिक विवरण मूल अंग्रेज़ी में दिखाए जा रहे हैं।'
      },{headers});
    }
    try {
      return NextResponse.json(await localizePremium(history,lang),{headers});
    } catch {
      return NextResponse.json({
        ...history,translationWarning:'हिंदी अनुवाद अस्थायी रूप से उपलब्ध नहीं है। ऐतिहासिक विवरण अंग्रेज़ी में दिखाए जा रहे हैं।'
      },{headers});
    }
  } catch {
    return NextResponse.json({error:lang==='hi'?'रिपोर्ट अभी नहीं मिल पा रही है।':'Historical archive unavailable. Please retry.'},{status:503,headers});
  }
}
