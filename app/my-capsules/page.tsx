'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CalendarDays, KeyRound, LoaderCircle } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { parseBirthday, prettyDate } from '@/lib/birthday';
export default function MyCapsules(){
  const [dates,setDates]=useState<string[]>([]);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState(false);
  useEffect(()=>{
    const ctrl=new AbortController();
    fetch('/api/my-capsules',{signal:ctrl.signal,cache:'no-store'})
      .then(res=>{if(!res.ok)throw new Error('unavailable');return res.json();})
      .then((data:{dates?:string[]})=>{if(!ctrl.signal.aborted)setDates(Array.isArray(data.dates)?data.dates:[]);})
      .catch(()=>{if(!ctrl.signal.aborted)setError(true);})
      .finally(()=>{if(!ctrl.signal.aborted)setBusy(false);});
    return()=>ctrl.abort();
  },[]);
  return <div className="site"><SiteHeader/>
    <main className="shell owned-capsules" id="main-content">
      <span className="eyebrow"><BookOpen size={16}/> YOUR PERSONAL ARCHIVE</span>
      <h1>Your Birthday <em>Time Capsules.</em></h1>
      <p>Purchased reports verified in this browser. For another device, open a private recovery link saved from your report.</p>
      {busy?<div className="owned-empty" role="status"><LoaderCircle size={24} className="spin"/> Checking purchases…</div>:
      error?<div className="owned-empty">Unable to check your purchase records right now. Please retry later.</div>:
      dates.length?<div className="owned-capsule-grid">{dates.map(date=>{
        const birth=parseBirthday(date);
        if(!birth)return null;
        return <Link className="owned-capsule" key={date} href={'/capsule?date='+encodeURIComponent(date)}>
          <span>AREYOURARE / VOL. 01</span>
          <CalendarDays size={24}/>
          <strong>{prettyDate(birth)}</strong>
          <small>THE HISTORY OF YOUR DAY · {birth.year}</small>
          <span className="owned-open">OPEN MY CAPSULE <ArrowUpRight size={16}/></span>
        </Link>;
      })}</div>:
      <div className="owned-empty"><KeyRound size={25}/>
        <h2>No verified capsules in this browser.</h2>
        <p>Already purchased one? Open it from the original browser or use the private recovery link you saved. If you lost both, contact payment support with your receipt.</p>
        <a href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20purchase%20recovery" className="inline-link">Contact report support <ArrowUpRight size={16}/></a>
      </div>}
      <Link href="/discover" className="button-secondary">Explore another date <ArrowUpRight size={16}/></Link>
    </main><SiteFooter/></div>;
}
