'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, CalendarDays, Copy, History, Sparkles, ShieldCheck, RefreshCw, Globe2 } from 'lucide-react';
import { parseBirthday, monthName } from '@/lib/birthday';
import type { FreeHistory } from '@/lib/history';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import { MomentCard } from '@/components/v2/MomentCard';
import { PremiumCTA } from '@/components/v2/PremiumCTA';

function Results() {
 const params=useSearchParams(),date=params.get('date')||'',birth=parseBirthday(date);
 const [history,setHistory]=useState<FreeHistory|null>(null),[paid,setPaid]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [copied,setCopied]=useState(false);
 useEffect(()=>{
  if(!birth){setError('Choose a real birth date to begin.');setLoading(false);return;}
  const ctrl=new AbortController();
  (async()=>{
   try{
    const [res,payment]=await Promise.all([
     fetch('/api/discover?date='+encodeURIComponent(date),{signal:ctrl.signal,cache:'no-store'}),
     fetch('/api/payment-status?date='+encodeURIComponent(date),{signal:ctrl.signal,cache:'no-store'})
    ]);
    const json=await res.json() as FreeHistory&{error?:string};
    if(!res.ok)throw new Error(json.error||'Unable to open historical archive.');
    let access=false;
    if(payment.ok){const status=await payment.json() as {paid?:boolean};access=Boolean(status.paid);}
    if(!ctrl.signal.aborted){setHistory(json);setPaid(access);}
   }catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Unable to load this date.');}
   finally{if(!ctrl.signal.aborted)setLoading(false);}
  })();
  return ()=>ctrl.abort();
 },[date,birth?.iso]);
 async function share(){
  const text='Discover the incredible history behind your birthday on AREYOURARE.';
  try{
   if(navigator.share) await navigator.share({title:'My Day in History',text,url:window.location.origin});
   else{await navigator.clipboard.writeText(text+' '+window.location.origin);setCopied(true);}
  }catch{/* Share dismissed */}
 }
 if(loading)return <div className="site loading-state"><div className="eyebrow">✳ AREYOURARE / ARCHIVE</div><div className="loader-line"/><p>Opening the history of your day…</p></div>;
 if(error||!history||!birth)return <div className="site"><SiteHeader/><main className="state-message shell"><span className="eyebrow">THE ARCHIVE</span><h1>We couldn't open this date.</h1><p>{error||'Try again soon.'}</p><Link href="/discover" className="button-primary"><RefreshCw size={17}/> Choose another date</Link></main><SiteFooter/></div>;
 return <div className="site result-page"><SiteHeader/><main>
   <section className="result-hero shell">
    <div className="result-heading"><span className="eyebrow"><Sparkles size={15}/> YOUR DAY IN HISTORY</span><button onClick={share} className="small-action">{copied?'Copied':'Share'} <Copy size={16}/></button></div>
    <div className="result-date-wrap"><div><span className="result-overline">THE DAY YOU WERE BORN</span><h1>{String(birth.day).padStart(2,'0')} <em>{monthName(birth.month)}</em></h1><p>One calendar date. Generations of extraordinary human stories.</p></div><span className="born-label">BORN IN<br/><strong>{birth.year}</strong></span></div>
    <div className="result-line"><span>DISCOVER WHAT THE WORLD REMEMBERS</span><span>↓ SCROLL TO EXPLORE</span></div>
   </section>
   <section className="feature-story shell"><div className="feature-story-copy"><span className="eyebrow">01 / THE FEATURED HISTORICAL MOMENT</span>
    <h2>Long before you,<br/><em>this happened.</em></h2><span className="giant-year">{history.featured.year}</span><h3>{history.featured.title}</h3>
    <p>{history.featured.text}</p>
    {history.featured.source&&<a className="inline-link" href={history.featured.source} target="_blank" rel="noopener noreferrer">Read the original Wikipedia story <ArrowUpRight size={17}/></a>}
   </div><div className="story-illustration"><span className="illustration-year">{history.featured.year}</span><div className="illustration-orbit"/><span className="illustration-star">✳</span>
    {history.featured.image?<img src={history.featured.image} alt={'Historical illustration for '+history.featured.title} loading="lazy"/>:<span className="illustration-placeholder">THE HUMAN ARCHIVE</span>}
    <div className="illustration-caption">A DOCUMENTED ANNIVERSARY ON YOUR CALENDAR DAY</div></div></section>
   <section className="connections shell"><div><span className="eyebrow">02 / AN UNEXPECTED CONNECTION</span><h2>Someone extraordinary <em>shares your date.</em></h2><p>Birthday twins recorded in history. People whose lives and work helped shape the world.</p></div>
     {history.person?<div className="person-card"><div><span className="eyebrow">BORN {history.person.year} / SAME MONTH &amp; DAY</span><span className="person-glyph">✺</span><h3>{history.person.title}</h3><p>{history.person.text}</p>
      {history.person.source&&<a href={history.person.source} className="inline-link" target="_blank" rel="noopener noreferrer">Explore their story <ArrowUpRight size={16}/></a>}
     </div>{history.person.image&&<img src={history.person.image} alt={history.person.title} loading="lazy"/>}</div>:
     <div className="person-card"><span className="eyebrow">THE PEOPLE ARCHIVE</span><h3>More stories live within your date.</h3><p>Not every date has a highlighted portrait available.</p></div>}
   </section>
   <section className="timeline-preview"><div className="shell"><div className="timeline-header"><div><span className="eyebrow">03 / YOUR DATE THROUGH THE CENTURIES</span><h2>And the story <em>goes on.</em></h2></div><p>ANOTHER GLIMPSE OF HISTORY</p></div>
    <div className="timeline-grid">{history.preview.map((entry,i)=><MomentCard key={entry.id} moment={entry} index={i+2}/>)}</div>
    <div className="year-disclaimer"><CalendarDays size={18}/>{history.exactDayYear?
      'A documented event also exists from your exact birth year ('+birth.year+').':
      'These are anniversaries from different years. An event from your exact birth year is not guaranteed.'}</div>
   </div></section>
   <section className="premium-wrap shell"><div className="premium-art"><span>THE<br/>TIME<br/>CAPSULE</span><span className="premium-art-date">{history.dayLabel.toUpperCase()}</span><span className="premium-art-star">✳</span></div><PremiumCTA date={date} paid={paid}/></section>
   <section className="result-foot shell"><p><History size={17}/> {history.totals.events} historical events · {history.totals.people} notable birthdays in the current Wikipedia feed</p>
    <p>{history.attribution} Events share your calendar day, not necessarily your birth year ({birth.year}).</p><Link href="/discover" className="inline-link">Discover another birthday <ArrowUpRight size={17}/></Link></section>
  </main><SiteFooter/></div>;
}
export default function ResultPage(){return <Suspense fallback={<div className="site loading-state">Opening your date…</div>}><Results/></Suspense>;}
