'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CalendarDays, KeyRound, LoaderCircle } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
import { parseBirthday } from '@/lib/birthday';

export default function MyCapsules(){
 const {lang,tr}=useLanguage();
 const [dates,setDates]=useState<string[]>([]);
 const [busy,setBusy]=useState(true),[error,setError]=useState(false);
 useEffect(()=>{
  const ctrl=new AbortController();
  fetch('/api/my-capsules',{signal:ctrl.signal,cache:'no-store'})
   .then(res=>{if(!res.ok)throw new Error('unavailable');return res.json();})
   .then((data:{dates?:string[]})=>{if(!ctrl.signal.aborted)setDates(Array.isArray(data.dates)?data.dates:[]);})
   .catch(()=>{if(!ctrl.signal.aborted)setError(true);})
   .finally(()=>{if(!ctrl.signal.aborted)setBusy(false);});
  return()=>ctrl.abort();
 },[]);
 return <div className="site"><SiteHeader/><main className="shell owned-capsules" id="main-content">
  <span className="eyebrow"><BookOpen size={16}/>{tr('YOUR PERSONAL REPORTS','आपकी निजी रिपोर्ट')}</span>
  <h1>{tr('My Birthday','मेरी जन्मदिन')} <em>{tr('Time Capsules.','की रिपोर्ट।')}</em></h1>
  <p>{tr('Reports purchased in this browser. Saved a private recovery link? You can open it on another device.','इस ब्राउज़र में खरीदी गई रिपोर्टें। निजी रिकवरी लिंक से दूसरे डिवाइस पर भी खोल सकते हैं।')}</p>
  {busy?<div className="owned-empty" role="status"><LoaderCircle size={24} className="spin"/>{tr('Checking purchases…','खरीदी गई रिपोर्ट जाँच रहे हैं…')}</div>:
  error?<div className="owned-empty">{tr('Could not check purchases. Please retry later.','रिपोर्ट जाँच नहीं पा रहे हैं। बाद में फिर कोशिश करें।')}</div>:
  dates.length?<div className="owned-capsule-grid">{dates.map(date=>{
   const birth=parseBirthday(date);
   if(!birth)return null;
   const label=new Date(Date.UTC(2000,birth.month-1,birth.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{month:'long',day:'numeric',timeZone:'UTC'});
   return <Link className="owned-capsule" key={date} href={'/result?date='+encodeURIComponent(date)}>
    <span>AREYOURARE / VOL. 01</span><CalendarDays size={24}/>
    <strong>{label}</strong><small>{tr('BIRTH YEAR','जन्म-वर्ष')} {birth.year}</small>
    <span className="owned-open">{tr('OPEN MY REPORT','मेरी रिपोर्ट खोलें')} <ArrowUpRight size={16}/></span>
   </Link>;
  })}</div>:
  <div className="owned-empty"><KeyRound size={25}/>
   <h2>{tr('No saved reports in this browser.','इस ब्राउज़र में कोई रिपोर्ट नहीं मिली।')}</h2>
   <p>{tr('Already paid? Use your private recovery link, or contact support using your checkout receipt.','पहले भुगतान किया था? निजी रिकवरी लिंक इस्तेमाल करें या भुगतान रसीद के साथ सहायता लें।')}</p>
   <a href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20purchase%20recovery" className="inline-link">{tr('Get support','सहायता लें')} <ArrowUpRight size={16}/></a>
  </div>}
  <Link href="/discover" className="button-secondary">{tr('Explore another day','दूसरी तारीख जानें')} <ArrowUpRight size={16}/></Link>
 </main><SiteFooter/></div>;
}
