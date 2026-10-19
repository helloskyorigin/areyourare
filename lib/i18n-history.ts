import { unstable_cache } from 'next/cache';
import type { FreeHistory, FullHistory, HistoricalMoment } from '@/lib/history';

export type AppLanguage = 'en' | 'hi';
export function apiLanguage(input:string|null):AppLanguage { return input==='hi'?'hi':'en'; }

/* Cloud Translation Basic v2 — server-only API key; no browser exposure.
   Historical references (IDs, years, citation URLs) are NEVER translated. */
export function hindiTranslationReady() {
  return Boolean(process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY);
}
async function translateBatch(lines:string[]):Promise<string[]> {
  const key=process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
  if(!key)throw new Error('HINDI_TRANSLATION_NOT_CONFIGURED');
  if(!lines.length)return [];
  const result:string[]=[];
  let batch:string[]=[],size=0;
  async function flush() {
    if(!batch.length)return;
    const items=batch;
    batch=[];size=0;
    const resp=await fetch('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(key!),{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({q:items,source:'en',target:'hi',format:'text'}),
      signal:AbortSignal.timeout(14000),
      cache:'no-store',
    });
    if(!resp.ok)throw new Error('HINDI_TRANSLATION_UNAVAILABLE');
    const json=await resp.json() as {data?:{translations?:{translatedText?:string}[]}};
    const converted=json.data?.translations;
    if(!converted||converted.length!==items.length||converted.some(t=>!t.translatedText))
      throw new Error('HINDI_TRANSLATION_INCOMPLETE');
    result.push(...converted.map(t=>decodeHtmlEntities(t.translatedText!)));
  }
  for(const line of lines){
    if(size+line.length>12000 || batch.length>=50)await flush();
    batch.push(line);size+=line.length;
  }
  await flush();
  return result;
}
function decodeHtmlEntities(input:string):string {
  return input.replace(/&#(x[0-9a-f]+|\d+);|&(?:quot|apos|amp|lt|gt);/gi,entity=>{
    const named:{[key:string]:string}={'&quot;':'"','&apos;':"'",'&amp;':'&','&lt;':'<','&gt;':'>'};
    if(named[entity.toLowerCase()])return named[entity.toLowerCase()];
    const numeric=entity.startsWith('&#x')||entity.startsWith('&#X') ?
      Number.parseInt(entity.slice(3,-1),16): Number.parseInt(entity.slice(2,-1),10);
    return Number.isFinite(numeric)&&numeric>0&&numeric<=0x10ffff?String.fromCodePoint(numeric):entity;
  });
}
async function translateMoments(moments:HistoricalMoment[]):Promise<HistoricalMoment[]> {
  const all=moments.flatMap(e=>[e.title,e.text]);
  const translated=await translateBatch(all);
  return moments.map((moment,i)=>({
    ...moment,
    title:translated[i*2]||moment.title,
    text:translated[i*2+1]||moment.text,
  }));
}
export async function localizeFree(history:FreeHistory,lang:AppLanguage):Promise<FreeHistory> {
  if(lang==='en')return history;
  const [featured]=await translateMoments([history.featured]);
  return {...history,featured,attribution:'ऐतिहासिक जानकारी सार्वजनिक स्रोतों से ली गई है। मूल लेख और लाइसेंस देखने के लिए स्रोत लिंक खोलें।'};
}
async function translatePremium(history:FullHistory):Promise<FullHistory> {
  // Translate the same canonical records throughout all tabs, by id, retaining
  // event chronology, source attribution and paywall server boundaries.
  const records=[...history.timeline,...history.people,...history.deaths];
  const localized=await translateMoments(records);
  const byId=new Map(localized.map(moment=>[moment.id,moment]));
  const map=(entries:HistoricalMoment[])=>entries.map(row=>byId.get(row.id)||row);
  return {...history,
    featured:byId.get(history.featured.id)||history.featured,
    person:history.person?(byId.get(history.person.id)||history.person):null,
    preview:map(history.preview),
    exactDayYear:history.exactDayYear?(byId.get(history.exactDayYear.id)||history.exactDayYear):null,
    timeline:map(history.timeline),people:map(history.people),deaths:map(history.deaths),exactMatches:map(history.exactMatches),
    attribution:'ऐतिहासिक जानकारी सार्वजनिक स्रोतों से ली गई है। मूल लेख देखने के लिए दिए गए लिंक खोलें।',
  };
}
export async function localizePremium(history:FullHistory,lang:AppLanguage):Promise<FullHistory>{
  if(lang==='en')return history;
  return getLocalizedPremium(history.birthDate,history);
}
// Full reports are translated only after premium entitlement verification.
// One translated report is cached per DOB, preventing repeat translation bills.
const getLocalizedPremium=unstable_cache(async (_date:string,history:FullHistory)=>translatePremium(history),['v2-hi-capsule'],{revalidate:86400});
