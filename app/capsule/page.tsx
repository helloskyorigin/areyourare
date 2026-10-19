'use client';
import { Suspense,useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft,ArrowUpRight,BookOpen,Download,Heart,Search,ShieldCheck,ArrowRight,Link2 } from 'lucide-react';
import { parseBirthday } from '@/lib/birthday';
import type { FullHistory,HistoricalMoment } from '@/lib/history';
import { useLanguage } from '@/components/v2/Language';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
type Tab='events'|'people'|'year';

function Capsule(){
 const params=useSearchParams(),date=params.get('date')||'',birth=parseBirthday(date);
 const {lang,tr}=useLanguage();
 const [data,setData]=useState<FullHistory|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [tab,setTab]=useState<Tab>('events'),[query,setQuery]=useState(''),[count,setCount]=useState(12);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [linkState,setLinkState]=useState<'idle'|'copied'|'error'>('idle');
 useEffect(()=>{
  if(!parseBirthday(date)){setError(tr('Choose a valid date.','सही जन्मतिथि चुनें।'));setLoading(false);return;}
  const ctrl=new AbortController();
  setLoading(true);setError('');setData(null);
  async function load(){
   try{
    const resp=await fetch('/api/capsule?date='+encodeURIComponent(date)+'&lang='+lang,{signal:ctrl.signal,cache:'no-store'});
    const json=await resp.json() as FullHistory&{error?:string};
    if(!resp.ok)throw new Error(json.error||tr('Unable to open report.','रिपोर्ट नहीं खुल पा रही है।'));
    if(!ctrl.signal.aborted)setData(json);
   }catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:tr('Please retry.','फिर कोशिश करें।'));}
   finally{if(!ctrl.signal.aborted)setLoading(false);}
  }
  void load();
  return()=>ctrl.abort();
 },[date,lang,tr]);
 const entries=useMemo(()=>{
  if(!data)return [];
  const list=tab==='events'?data.timeline:tab==='people'?data.people:data.exactMatches;
  return list.filter(x=>(x.year+' '+x.title+' '+x.text).toLowerCase().includes(query.toLowerCase()));
 },[tab,query,data]);
 const display=birth?new Date(Date.UTC(2000,birth.month-1,birth.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{day:'numeric',month:'long',timeZone:'UTC'}):'';
 function toggle(entry:HistoricalMoment){setFavorites(now=>now.includes(entry.id)?now.filter(x=>x!==entry.id):[...now,entry.id]);}
 async function copyRecoveryLink(){
  if(!data)return;
  try{
   setLinkState('idle');
   const res=await fetch('/api/recovery-link?date='+encodeURIComponent(date),{cache:'no-store'});
   const json=await res.json() as {recoveryUrl?:string};
   if(!res.ok||!json.recoveryUrl)throw new Error('Unable to copy');
   await navigator.clipboard.writeText(json.recoveryUrl);
   setLinkState('copied');
  }catch{setLinkState('error');}
 }
 if(loading)return <div className="site loading-state"><div className="loader-line"/><p>{tr('Opening your full report…','आपकी पूरी रिपोर्ट खुल रही है…')}</p></div>;
 if(!data||!birth||error)return <div className="site"><SiteHeader/><main className="state-message shell">
  <span className="eyebrow">{tr('PAYMENT VERIFICATION','भुगतान की पुष्टि')}</span>
  <h1>{tr('Your report is still locked.','आपकी रिपोर्ट अभी लॉक है।')}</h1>
  <p>{error||tr('Please return to your result.','कृपया रिज़ल्ट पर वापस जाएँ।')}</p>
  <p>{tr('Open this page in the browser used for checkout, or use a saved private recovery link.','भुगतान वाले ब्राउज़र में यह पेज खोलें, या अपना निजी रिकवरी लिंक इस्तेमाल करें।')}</p>
  <Link className="button-primary" href={'/unlock?date='+encodeURIComponent(date)}>{tr('Back to date preview','अपनी तारीख की झलक पर जाएँ')} <ArrowLeft size={17}/></Link>
 </main><SiteFooter/></div>;

 return <div className="site capsule-page"><SiteHeader/><main>
  <section className="capsule-cover shell"><div className="capsule-cover-top"><span className="eyebrow">AREYOURARE</span><span className="eyebrow">{tr('YOUR PERSONAL REPORT','आपकी निजी रिपोर्ट')}</span></div>
   <span className="cover-big-star">✳</span>
   <div><span className="eyebrow">{tr('YOUR BIRTHDAY TIME CAPSULE','आपके जन्मदिन की टाइम कैप्सूल')}</span>
    <h1>{display}</h1>
    <p>{tr('Your full collection of historical moments.','आपकी तारीख की ऐतिहासिक घटनाओं का पूरा संग्रह।')}</p>
    <span className="cover-birth-year">{tr('BORN','जन्म-वर्ष')} {birth.year} · {tr('EVENTS ARE FROM DIFFERENT YEARS','घटनाएँ अलग-अलग वर्षों की हैं')}</span>
   </div>
   <div className="capsule-cover-bottom"><span>{tr('THE FULL STORY','पूरी कहानी')}</span><span>↓ {tr('EXPLORE BELOW','नीचे देखें')}</span></div>
  </section>
  {data.translationWarning&&<div className="shell report-translation-warning" role="status">{data.translationWarning}</div>}
  <section className="capsule-summary shell">
   <div><strong>{data.timeline.length}</strong><span>{tr('HISTORICAL EVENTS','ऐतिहासिक घटनाएँ')}</span></div>
   <div><strong>{data.people.length}</strong><span>{tr('NOTABLE BIRTHDAYS','प्रसिद्ध जन्मदिन')}</span></div>
   <div><strong>{data.exactMatches.length}</strong><span>{tr('EXACT-YEAR EVENTS','जन्म-वर्ष की घटनाएँ')}</span></div>
  </section>
  <section className="capsule-archive shell" id="archive">
   <div className="capsule-archive-head">
    <div><span className="eyebrow">{tr('EXPLORE YOUR REPORT','अपनी रिपोर्ट देखें')}</span>
     <h2>{tr('Your complete','आपका पूरा')}<br/><em>{tr('birthday history.','जन्मदिन का इतिहास।')}</em></h2>
     <p>{tr('Explore the full archive and its original sources.','पूरा ऐतिहासिक संग्रह और मूल स्रोत देखें।')}</p></div>
    <div className="capsule-utility-actions">
     <button type="button" className="button-secondary" onClick={copyRecoveryLink}>
      <Link2 size={17}/>{linkState==='copied'?tr('Link copied','लिंक कॉपी हो गया'):tr('Copy private recovery link','निजी रिकवरी लिंक कॉपी करें')}
     </button>
     <button type="button" className="button-secondary print-button" onClick={()=>window.print()}><Download size={17}/>{tr('Save full PDF','पूरी PDF सेव करें')}</button>
    </div>
   </div>
   <p className="capsule-recovery-note" role="status">{linkState==='error'?
    tr('Could not copy the link. Check clipboard permission.','लिंक कॉपी नहीं हुआ। क्लिपबोर्ड अनुमति जाँचें।'):
    linkState==='copied'?tr('Keep this private link safe. Anyone with it can access this report until expiry.','लिंक निजी रखें। जिसके पास यह लिंक होगा, वह समाप्ति तक रिपोर्ट खोल सकेगा।'):
    tr('Save a private link to reopen this report on another device within the access period.','दूसरे डिवाइस पर रिपोर्ट खोलने के लिए निजी लिंक सहेज लें।')}</p>
   <div className="capsule-tabs" role="tablist" aria-label={tr('Report categories','रिपोर्ट के भाग')}>
    <button type="button" role="tab" aria-selected={tab==='events'} className={tab==='events'?'active':''} onClick={()=>{setTab('events');setCount(12);}}>{tr('Timeline','घटनाएँ')} <span>{data.timeline.length}</span></button>
    <button type="button" role="tab" aria-selected={tab==='people'} className={tab==='people'?'active':''} onClick={()=>{setTab('people');setCount(12);}}>{tr('Famous birthdays','प्रसिद्ध जन्मदिन')} <span>{data.people.length}</span></button>
    <button type="button" role="tab" aria-selected={tab==='year'} className={tab==='year'?'active':''} onClick={()=>{setTab('year');setCount(12);}}>{tr('Birth year','जन्म-वर्ष')} <span>{data.exactMatches.length}</span></button>
   </div>
   <label className="capsule-search"><Search size={18}/><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setCount(12);}}
    placeholder={tr('Search stories and years…','घटनाएँ और वर्ष खोजें…')} aria-label={tr('Search report','रिपोर्ट में खोजें')}/></label>
   {entries.length?<div className="archive-list">{entries.slice(0,count).map(item=><article className="archive-entry" key={item.id}>
    <div className="archive-entry-year"><strong>{item.year}</strong><span>{item.kind==='birth'?tr('BIRTH','जन्म'):tr('HISTORY','इतिहास')}</span></div>
    <div><h3>{item.title}</h3><p>{item.text}</p>{item.source&&<a href={item.source} className="inline-link" target="_blank" rel="noopener noreferrer">{tr('Original source','मूल स्रोत')} <ArrowUpRight size={15}/></a>}</div>
    <button type="button" className={'favorite-button '+(favorites.includes(item.id)?'is-favorite':'')} onClick={()=>toggle(item)}
     aria-label={favorites.includes(item.id)?tr('Remove favorite','पसंदीदा से हटाएँ'):tr('Save favorite','पसंदीदा में जोड़ें')}
     title={tr('Save for this visit','इस बार के लिए सहेजें')}><Heart size={19} fill={favorites.includes(item.id)?'currentColor':'none'}/></button>
   </article>)}</div>:
    <div className="archive-empty"><BookOpen size={27}/><h3>{tr('No matching stories.','ऐसी घटना नहीं मिली।')}</h3>
     <p>{tab==='year'?tr('An exact-year event may not be listed for this date.','इस जन्म-वर्ष और तारीख पर कोई दर्ज घटना उपलब्ध नहीं हो सकती।'):tr('Try another search.','दूसरा शब्द खोजें।')}</p></div>}
   {entries.length>count&&<button type="button" className="button-secondary more-button" onClick={()=>setCount(n=>n+12)}>{tr('Show more','और दिखाएँ')} <ArrowRight size={17}/></button>}
  </section>
  <section className="capsule-print-report" aria-label={tr('Complete printable report','पूरी प्रिंट योग्य रिपोर्ट')}>
   <h1>{tr('AREYOURARE · YOUR BIRTHDAY TIME CAPSULE','AREYOURARE · आपके जन्मदिन की टाइम कैप्सूल')}</h1>
   <p>{display} · {tr('Born','जन्म-वर्ष')} {data.birthYear}</p>
   <p>{tr('These documented events occurred on your calendar date across different years; they are not predictions.','ये घटनाएँ अलग-अलग वर्षों में आपकी जन्मतिथि वाले दिन हुई थीं। ये भविष्यवाणियाँ नहीं हैं।')}</p>
   <h2>{tr('Complete historical timeline','पूरी ऐतिहासिक समयरेखा')} ({data.timeline.length})</h2>
   {data.timeline.map(item=><article className="capsule-print-item" key={'print-event-'+item.id}>
    <h3>{item.year} · {item.title}</h3><p>{item.text}</p>{item.source&&<p className="capsule-print-source">{tr('Source','स्रोत')}: {item.source}</p>}
   </article>)}
   <h2>{tr('Notable birthdays','प्रसिद्ध जन्मदिन')} ({data.people.length})</h2>
   {data.people.map(item=><article className="capsule-print-item" key={'print-person-'+item.id}>
    <h3>{item.year} · {item.title}</h3><p>{item.text}</p>{item.source&&<p className="capsule-print-source">{tr('Source','स्रोत')}: {item.source}</p>}
   </article>)}
   <h2>{tr('Exact birth-year events','आपके जन्म-वर्ष की घटनाएँ')} ({data.exactMatches.length})</h2>
   {!data.exactMatches.length&&<p>{tr('No exact-year event in available records.','उपलब्ध इतिहास में इस दिन आपके जन्म-वर्ष की घटना नहीं मिली।')}</p>}
   {data.exactMatches.map(item=><article className="capsule-print-item" key={'print-year-'+item.id}>
    <h3>{item.year} · {item.title}</h3><p>{item.text}</p>{item.source&&<p className="capsule-print-source">{tr('Source','स्रोत')}: {item.source}</p>}
   </article>)}
   <p className="capsule-print-credit">{tr('Historical records: Wikipedia and Wikimedia contributors. Open source links for attribution and licenses.','ऐतिहासिक स्रोत: विकिपीडिया और विकिमीडिया के योगदानकर्ता। श्रेय और लाइसेंस के लिए मूल स्रोत लिंक देखें।')}</p>
  </section>
  <section className="archive-conclusion shell"><ShieldCheck size={23}/><div>
   <h3>{tr('Real history. Verified sources.','असली इतिहास। मूल स्रोत।')}</h3>
   <p>{tr('Historical records come from public archives. Follow the original links for full context. Dates are not predictions.','ऐतिहासिक जानकारी सार्वजनिक संग्रहों से ली गई है। अधिक जानकारी के लिए मूल स्रोत खोलें। यह कोई भविष्यवाणी नहीं है।')}</p>
  </div></section>
 </main><SiteFooter/></div>;
}
export default function CapsulePage(){
 return <Suspense fallback={<div className="site loading-state">AREYOURARE</div>}><Capsule/></Suspense>;
}
