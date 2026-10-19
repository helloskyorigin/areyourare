'use client';
import { Suspense,useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter,useSearchParams } from 'next/navigation';
import { ArrowLeft,ArrowRight,LoaderCircle,RotateCcw } from 'lucide-react';
import { SiteHeader } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
import { parseBirthday } from '@/lib/birthday';
import type { FreeHistory } from '@/lib/history';

function Searching(){
 const router=useRouter(),params=useSearchParams(),{lang,tr}=useLanguage();
 const date=params.get('date')||'';
 const birthday=parseBirthday(date);
 const [state,setState]=useState<'loading'|'error'>('loading');
 const [error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!parseBirthday(date)){setState('error');setError(tr('Choose a valid date.','कृपया सही तारीख चुनें।'));return;}
  const ctrl=new AbortController();
  setState('loading');setError('');
  async function fetchMoment(){
   try{
    const res=await fetch('/api/discover?date='+encodeURIComponent(date)+'&lang='+lang,{
     signal:ctrl.signal,cache:'no-store',
    });
    const data=await res.json() as FreeHistory & {error?:string};
    if(!res.ok||!data.featured?.title)throw new Error(data.error||tr('Unable to find your event.','घटना नहीं मिल पाई।'));
    if(ctrl.signal.aborted)return;
    try{sessionStorage.setItem('ayr:free-discovery:v3',JSON.stringify({
      date,lang,savedAt:Date.now(),result:data,
    }));}catch{/* Optional cache */}
    router.replace('/result?date='+encodeURIComponent(date));
   }catch(err){
    if(ctrl.signal.aborted)return;
    setError(err instanceof Error?err.message:tr('Please retry.','कृपया फिर कोशिश करें।'));
    setState('error');
   }
  }
  void fetchMoment();
  return()=>ctrl.abort();
 },[date,lang,retry,router,tr]);
 const display=birthday?new Date(Date.UTC(2000,birthday.month-1,birthday.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{day:'numeric',month:'long',timeZone:'UTC'}):'—';
 return <div className="site scan2-page">
   <SiteHeader/>
   <main className="scan2-main shell" id="main-content">
     <div className="scan2-issue"><span>AREYOURARE / {tr('YOUR DATE','आपकी तारीख')}</span><span>01 — {tr('DISCOVERY','खोज')}</span></div>
     <div className="scan2-sheet">
       <div className="scan2-content">
         <span className="eyebrow">✳ {tr('LOOKING THROUGH HISTORY','इतिहास में खोज जारी है')}</span>
         <h1>{state==='loading'?tr('Finding your','आपकी खास'):tr('Couldn’t open','आपकी खोज')}<br/>
           <em>{state==='loading'?tr('moment.','घटना...'):tr('your moment.','पूरी नहीं हुई।')}</em>
         </h1>
         <p>{state==='loading'?tr('Finding one real historical event linked to your birthday.','आपके जन्मदिन से जुड़ी एक असली ऐतिहासिक घटना खोज रहे हैं।'):error}</p>
         {state==='loading'?<div className="scan2-loader" role="status" aria-label={tr('Searching historical records','इतिहास खोज रहे हैं')}><span/></div>:
          <div className="scan2-actions">
           <button type="button" className="button-primary" onClick={()=>setRetry(x=>x+1)}><RotateCcw size={16}/>{tr('Try again','फिर कोशिश करें')}</button>
           <Link href="/discover" className="button-secondary"><ArrowLeft size={16}/>{tr('Change date','तारीख बदलें')}</Link>
          </div>}
       </div>
       <div className="scan2-date" aria-label={tr('Selected birthday','चुना गया जन्मदिन')}>
         <span>{tr('YOUR DAY','आपका दिन')}</span>
         <strong>{display}</strong>
         <span>{birthday?birthday.year:'—'}</span>
         <small>{tr('ONE DATE · ONE FREE STORY','एक तारीख · एक मुफ़्त कहानी')}</small>
       </div>
     </div>
     <div className="scan2-bottom"><span>{tr('A REAL MOMENT, NOT A PREDICTION','एक असली घटना, कोई भविष्यवाणी नहीं')}</span>
      <Link href="/discover">{tr('Go back','वापस जाएँ')} <ArrowRight size={14}/></Link>
     </div>
   </main>
 </div>;
}
export default function SearchingPage(){
 return <Suspense fallback={<div className="site scan2-page"/>}><Searching/></Suspense>;
}
