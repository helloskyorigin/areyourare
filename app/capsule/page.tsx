'use client';
import { Suspense,useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft,ArrowUpRight,BookOpen,Download,Heart,Search,ShieldCheck,ArrowRight } from 'lucide-react';
import { parseBirthday,monthName } from '@/lib/birthday';
import type { FullHistory,HistoricalMoment } from '@/lib/history';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';

type Tab='events'|'people'|'year';
function Capsule(){
 const params=useSearchParams(),date=params.get('date')||'',birth=parseBirthday(date);
 const [data,setData]=useState<FullHistory|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [tab,setTab]=useState<Tab>('events'),[query,setQuery]=useState(''),[count,setCount]=useState(12);
 const [favorites,setFavorites]=useState<string[]>([]);
 useEffect(()=>{
  if(!birth){setError('Choose a valid birth date.');setLoading(false);return;}
  const controller=new AbortController();
  (async()=>{try{
   const res=await fetch('/api/capsule?date='+encodeURIComponent(date),{signal:controller.signal,cache:'no-store'});
   const json=await res.json() as FullHistory&{error?:string};
   if(!res.ok)throw new Error(json.error||'Unable to unlock your archive');
   if(!controller.signal.aborted)setData(json);
  }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Could not load your archive');}
   finally{if(!controller.signal.aborted)setLoading(false);}})();
  return ()=>controller.abort();
 },[birth?.iso,date]);
 const entries=useMemo(()=>{
  if(!data)return [];
  const list=tab==='events'?data.timeline:tab==='people'?data.people:data.exactMatches;
  return list.filter(x=>(x.year+' '+x.title+' '+x.text).toLowerCase().includes(query.toLowerCase()));
 },[tab,query,data]);
 function toggle(entry:HistoricalMoment){setFavorites(current=>current.includes(entry.id)?current.filter(x=>x!==entry.id):[...current,entry.id]);}
 if(loading)return <div className="site loading-state"><div className="loader-line"/><p>Opening your Time Capsule…</p></div>;
 if(!data||!birth||error)return <div className="site"><SiteHeader/><main className="state-message shell"><span className="eyebrow">PURCHASE VERIFICATION</span><h1>Your capsule is still locked.</h1><p>{error||'Please return to your results.'}</p><p>Open this page from the browser you used for checkout. If you recently paid, retry from your results.</p><Link className="button-primary" href={'/result?date='+encodeURIComponent(date)}>Return to results <ArrowLeft size={17}/></Link></main><SiteFooter/></div>;
 return <div className="site capsule-page"><SiteHeader/><main>
  <section className="capsule-cover shell"><div className="capsule-cover-top"><span className="eyebrow">AREYOURARE PRESENTS</span><span className="eyebrow">A PERSONAL ARCHIVE / VOL. 01</span></div>
    <span className="cover-big-star">✳</span><div><span className="eyebrow">YOUR BIRTHDAY TIME CAPSULE</span><h1>{String(birth.day).padStart(2,'0')} <em>{monthName(birth.month)}</em></h1><p>An extraordinary journey through the history of your date.</p><span className="cover-birth-year">BORN {birth.year} · ALL EVENTS ARE DOCUMENTED ANNIVERSARIES</span></div>
    <div className="capsule-cover-bottom"><span>THE STORIES BEHIND YOUR DAY</span><span>↓ THE ARCHIVE BEGINS BELOW</span></div></section>
  <section className="capsule-summary shell"><div><strong>{data.timeline.length}</strong><span>HISTORICAL EVENTS</span></div><div><strong>{data.people.length}</strong><span>NOTABLE BIRTHDAYS</span></div><div><strong>{data.exactMatches.length}</strong><span>EXACT-YEAR EVENTS</span></div></section>
  <section className="capsule-archive shell" id="archive">
   <div className="capsule-archive-head"><div><span className="eyebrow">01 / EXPLORE YOUR ARCHIVE</span><h2>Centuries of stories.<br/><em>One shared day.</em></h2><p>Explore and search real historical entries. Follow Wikipedia links to learn more.</p></div>
    <button type="button" className="button-secondary print-button" onClick={()=>window.print()}><Download size={17}/> Save / print PDF</button></div>
   <div className="capsule-tabs" role="tablist" aria-label="Historical record categories">
    <button role="tab" aria-selected={tab==='events'} className={tab==='events'?'active':''} onClick={()=>{setTab('events');setCount(12);}}>Historical timeline <span>{data.timeline.length}</span></button>
    <button role="tab" aria-selected={tab==='people'} className={tab==='people'?'active':''} onClick={()=>{setTab('people');setCount(12);}}>Famous birthdays <span>{data.people.length}</span></button>
    <button role="tab" aria-selected={tab==='year'} className={tab==='year'?'active':''} onClick={()=>{setTab('year');setCount(12);}}>Your birth year <span>{data.exactMatches.length}</span></button></div>
   <label className="capsule-search"><Search size={18}/><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setCount(12);}} placeholder="Search years, people and moments…" aria-label="Search your archive"/></label>
   {entries.length? <div className="archive-list">{entries.slice(0,count).map((item,index)=><article className="archive-entry" key={item.id}>
    <div className="archive-entry-year"><strong>{item.year}</strong><span>{item.kind==='birth'?'BIRTH':'HISTORY'}</span></div>
    <div><h3>{item.title}</h3><p>{item.text}</p>{item.source&&<a href={item.source} className="inline-link" target="_blank" rel="noopener noreferrer">Read source <ArrowUpRight size={15}/></a>}</div>
    <button className={'favorite-button '+(favorites.includes(item.id)?'is-favorite':'')} onClick={()=>toggle(item)} title="Save to favorites for this visit" aria-label={favorites.includes(item.id)?'Remove from favorites':'Add to favorites'}><Heart size={19} fill={favorites.includes(item.id)?'currentColor':'none'}/></button>
   </article>)}</div>:<div className="archive-empty"><BookOpen size={27}/><h3>No stories in this section yet.</h3><p>{tab==='year'?'Wikipedia may not have a listed event for your exact birthday and birth year. Your wider birthday timeline is still waiting.':'Try another search or category.'}</p></div>}
   {entries.length>count&&<button className="button-secondary more-button" onClick={()=>setCount(x=>x+12)}>Explore more stories <ArrowRight size={17}/></button>}
  </section>
  <section className="archive-conclusion shell"><ShieldCheck size={23}/><div><h3>Real history. Open sources.</h3><p>Historical events and birth dates are provided by Wikipedia and its contributors. Read the original articles for fuller context and licensing. We never invent exact-year matches or predict your life from the date you were born.</p></div></section>
  </main><SiteFooter/></div>;
}
export default function CapsulePage(){return <Suspense fallback={<div className="site loading-state">Opening your Time Capsule…</div>}><Capsule/></Suspense>;}
