'use client';
import { Suspense,useEffect,useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft,ArrowUpRight,CalendarDays,RotateCcw,Share2 } from 'lucide-react';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { PremiumCTA } from '@/components/v2/PremiumCTA';
import { useLanguage } from '@/components/v2/Language';
import { parseBirthday } from '@/lib/birthday';
import type { FreeHistory } from '@/lib/history';

type Cached={date:string;lang:'en'|'hi';savedAt:number;result:FreeHistory};
function Result(){
 const params=useSearchParams(),{lang,tr}=useLanguage(),date=params.get('date')||'';
 const birthday=parseBirthday(date);
 const [data,setData]=useState<FreeHistory|null>(null);
 const [paid,setPaid]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [shared,setShared]=useState(false);
 useEffect(()=>{
  if(!parseBirthday(date)){setError(tr('Select a valid birthday.','सही जन्मतिथि चुनें।'));setLoading(false);return;}
  const ctrl=new AbortController();
  setLoading(true);setError('');setData(null);setPaid(false);
  async function load(){
   if(retry===0)try{
    const raw=sessionStorage.getItem('ayr:free-discovery:v3');
    if(raw){
     const cached=JSON.parse(raw) as Cached;
     if(cached.date===date&&cached.lang===lang&&Date.now()-cached.savedAt<10*60*1000&&cached.result?.featured?.title){
      if(!ctrl.signal.aborted){setData(cached.result);setLoading(false);}
      return;
     }
    }
   }catch{/* Fetch below */}
   try{
    const response=await fetch('/api/discover?date='+encodeURIComponent(date)+'&lang='+lang,{signal:ctrl.signal,cache:'no-store'});
    const result=await response.json() as FreeHistory&{error?:string};
    if(!response.ok||!result.featured?.title)throw new Error(result.error||tr('Discovery unavailable.','खोज उपलब्ध नहीं है।'));
    if(!ctrl.signal.aborted){setData(result);setLoading(false);}
   }catch(e){
    if(!ctrl.signal.aborted){setError(e instanceof Error?e.message:tr('Please retry.','फिर कोशिश करें।'));setLoading(false);}
   }
  }
  async function checkPayment(){
   try{
    const response=await fetch('/api/payment-status?date='+encodeURIComponent(date),{signal:ctrl.signal,cache:'no-store'});
    if(response.ok){const result=await response.json() as {paid?:boolean};if(!ctrl.signal.aborted)setPaid(result.paid===true);}
   }catch{/* Free report remains available */}
  }
  void load();void checkPayment();
  return()=>ctrl.abort();
 },[date,lang,retry,tr]);
 async function share(){
  try{
   const url=window.location.origin+'/';
   const message=tr('Discover the history behind your birthday.','अपने जन्मदिन का इतिहास जानें।');
   if(navigator.share)await navigator.share({title:'AREYOURARE',text:message,url});
   else{await navigator.clipboard.writeText(message+' '+url);setShared(true);}
  }catch{/* User cancelled share */}
 }
 const label=birthday?new Date(Date.UTC(2000,birthday.month-1,birthday.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{day:'numeric',month:'long',timeZone:'UTC'}):'';
 if(loading)return <div className="site scan2-page"><SiteHeader/><main className="scan2-main shell"><span className="eyebrow">✳ {tr('YOUR DAY IN HISTORY','इतिहास में आपका दिन')}</span><h1 className="result2-loading">{tr('Opening your story…','आपकी कहानी खुल रही है…')}</h1><div className="scan2-loader"><span/></div></main></div>;
 if(error||!data||!birthday)return <div className="site"><SiteHeader/><main className="state-message shell">
  <h1>{tr('Your story isn’t available yet.','आपकी कहानी अभी उपलब्ध नहीं है।')}</h1>
  <p role="alert">{error||tr('Please try again.','कृपया फिर कोशिश करें।')}</p>
  <button type="button" className="button-primary" onClick={()=>setRetry(x=>x+1)}><RotateCcw size={16}/>{tr('Try again','फिर कोशिश करें')}</button>
  <Link href="/discover" className="button-secondary">{tr('Change birthday','जन्मतिथि बदलें')}</Link>
 </main><SiteFooter/></div>;
 return <div className="site result2-page"><SiteHeader/>
  <main className="result2-main shell" id="main-content">
   <div className="result2-topline">
    <span className="eyebrow">✳ {tr('YOUR DAY IN HISTORY','इतिहास में आपका दिन')}</span>
    <button type="button" className="result2-share" onClick={share}><Share2 size={15}/>{shared?tr('Copied','कॉपी हो गया'):tr('Share','शेयर करें')}</button>
   </div>
   <div className="result2-heading">
    <div><span>{tr('YOUR BIRTHDAY','आपका जन्मदिन')}</span><h1>{label}</h1>
     <p><CalendarDays size={14}/>{tr('Born in','जन्म-वर्ष')} {birthday.year} · {tr('The event below is from its actual historical year.','नीचे घटना का वास्तविक वर्ष दिया गया है।')}</p>
    </div>
    <Link href="/discover" className="result2-change">{tr('Change date','तारीख बदलें')} <ArrowUpRight size={14}/></Link>
   </div>
   <div className="result2-mobile-teaser">
    <span>{tr('YOUR FREE MOMENT','आपकी मुफ़्त घटना')} · {data.featured.year}</span>
    <strong>{data.featured.title}</strong>
   </div>
   <div className="result2-grid">
    <article className="result2-event">
     <div className="result2-event-label"><span>01 / {tr('YOUR FREE DISCOVERY','आपकी मुफ़्त खोज')}</span><span>{tr('ONE REAL EVENT','एक असली घटना')}</span></div>
     <div className="result2-event-main">
      <span className="result2-year">{data.featured.year}</span>
      <h2>{data.featured.title}</h2>
      <p>{data.featured.text}</p>
      {data.featured.source&&<a href={data.featured.source} rel="noopener noreferrer" target="_blank" className="result2-source">
       {tr('Original historical source','मूल ऐतिहासिक स्रोत')} <ArrowUpRight size={17}/>
      </a>}
     </div>
     <div className="result2-event-note">{tr('This event shares your calendar date, not necessarily your birth year.','यह घटना आपकी जन्मतिथि वाले दिन की है, ज़रूरी नहीं कि आपके जन्म-वर्ष की हो।')}</div>
    </article>
    <section className="result2-upgrade" aria-label={tr('Unlock the full archive','पूरी रिपोर्ट खोलें')}>
     <PremiumCTA date={date} paid={paid}/>
    </section>
   </div>
   <div className="result2-bottom"><span>{tr('That’s your free story. The complete archive is available for $2.','यह आपकी मुफ़्त कहानी थी। पूरी ऐतिहासिक रिपोर्ट सिर्फ़ $2 में मिलेगी।')}</span>
    <Link href="/discover"><ArrowLeft size={14}/>{tr('Explore another date','दूसरी तारीख जानें')}</Link>
   </div>
  </main><SiteFooter/>
 </div>;
}
export default function ResultPage(){return <Suspense fallback={<div className="site result2-page"/>}><Result/></Suspense>;}
