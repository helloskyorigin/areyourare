import { NextRequest, NextResponse } from 'next/server';
import { parseBirthday } from '@/lib/birthday';
import { loadHistory, freeHistory } from '@/lib/history';
import { apiLanguage, hindiTranslationReady, localizeFree } from '@/lib/i18n-history';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const date=parseBirthday(request.nextUrl.searchParams.get('date'));
 const lang=apiLanguage(request.nextUrl.searchParams.get('lang'));
 if(!date)return NextResponse.json({error:lang==='hi'?'कृपया सही जन्मतिथि चुनें।':'Please choose a valid birthday.'},{status:400});
 if(lang==='hi'&&!hindiTranslationReady())return NextResponse.json({
  error:'हिंदी में ऐतिहासिक जानकारी अभी उपलब्ध नहीं है। कृपया कुछ देर बाद कोशिश करें।',
  code:'HINDI_TRANSLATION_NOT_CONFIGURED',
 },{status:503});
 try{
  const full=await loadHistory(date);
  const free=freeHistory(full);
  return NextResponse.json(await localizeFree(free,lang),{
   headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'},
  });
 }catch{
  return NextResponse.json({error:lang==='hi'?'ऐतिहासिक जानकारी अभी नहीं मिल पा रही है। फिर कोशिश करें।':'The historical archive is temporarily unavailable. Please retry.'},{status:503});
 }
}
