'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/v2/Brand';
import { parseBirthday,prettyDate } from '@/lib/birthday';
function Searching() {
 const params=useSearchParams(),router=useRouter();
 const date=params.get('date')||'',birth=parseBirthday(date);
 const [message,setMessage]=useState('Opening the archive…');
 useEffect(()=>{
  if (!birth) {router.replace('/discover');return;}
  let cancelled=false;
  async function check(){
   try {
    const res=await fetch('/api/discover?date='+encodeURIComponent(date),{cache:'no-store'});
    if (!res.ok) {setMessage('The archive could not be reached. Please try again.');return;}
    if (!cancelled) router.replace('/result?date='+encodeURIComponent(date));
   } catch {if(!cancelled)setMessage('Connection interrupted. Please try again.');}
  }
  check();
  return ()=>{cancelled=true};
 },[birth?.iso,date,router]);
 return <div className="site"><SiteHeader/><main className="searching-center shell">
  <span className="eyebrow">AREYOURARE / THE TIME ARCHIVE</span>
  <div className="searching-orbit"><span className="searching-orbit-ring"/><div><strong>{birth?String(birth.day).padStart(2,'0'):'✳'}</strong><em>{birth?prettyDate(birth).split(' ')[0].toUpperCase():'HISTORY'}</em></div></div>
  <h1>Tracing your day <em>through history.</em></h1><p>{message}</p>
  <Link href="/discover" className="inline-link">Change birthday ↗</Link>
 </main></div>;
}
export default function SearchingPage() {return <Suspense fallback={<div className="site searching-center">Opening the archive…</div>}><Searching/></Suspense>;}
