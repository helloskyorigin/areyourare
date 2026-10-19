'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LockKeyhole, LoaderCircle } from 'lucide-react';
export function PremiumCTA({date,paid}:{date:string;paid:boolean}) {
  const [loading,setLoading]=useState(false);
  const [availability,setAvailability]=useState<'loading'|'ready'|'disabled'>('loading');
  const [testMode,setTestMode]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/checkout-availability',{signal:controller.signal,cache:'no-store'})
      .then(res=>res.json())
      .then((result:{available?:boolean;testMode?:boolean})=>{
        if(controller.signal.aborted)return;
        setAvailability(result.available?'ready':'disabled');
        setTestMode(result.testMode===true);
      }).catch(()=>{if(!controller.signal.aborted)setAvailability('disabled');});
    return()=>controller.abort();
  },[]);
  async function checkout(){
    if(loading||availability!=='ready')return;
    setLoading(true);setError('');
    try {
      const res=await fetch('/api/checkout',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date})
      });
      const data=await res.json() as {checkoutUrl?:string;error?:string};
      if(!res.ok||!data.checkoutUrl)throw new Error(data.error||'Checkout unavailable');
      const url=new URL(data.checkoutUrl);
      if(url.protocol!=='https:'||
        !(url.hostname==='dodopayments.com'||url.hostname.endsWith('.dodopayments.com')))
        throw new Error('Invalid secure checkout destination.');
      window.location.assign(url.toString());
    } catch(e){
      setError(e instanceof Error?e.message:'Unable to start checkout.');
      setLoading(false);
    }
  }
  return <div className="premium">
    <div className="eyebrow">✳ YOUR BIRTHDAY TIME CAPSULE</div>
    <h2>Your birthday has <em>more stories.</em></h2>
    <p>You've discovered one moment. Open the full historical timeline, explore the lives connected to your day, and keep your own source-linked Birthday Time Capsule.</p>
    <div className="premium-benefits">
      <span><Check size={15}/> Complete historical timeline</span>
      <span><Check size={15}/> Famous birthday connections</span>
      <span><Check size={15}/> Birth-year matches when available</span>
      <span><Check size={15}/> Complete print-ready archive</span>
    </div>
    <div className="premium-bottom">
      <strong>$2 <small>one time</small></strong>
      {paid?
        <Link href={'/capsule?date='+encodeURIComponent(date)} className="button-primary">
          Open my capsule <ArrowUpRight size={18}/>
        </Link>:
        <button className="button-primary" type="button" onClick={checkout}
          disabled={loading||availability!=='ready'}>
          {loading||availability==='loading'?<LoaderCircle className="spin" size={18}/>:<LockKeyhole size={17}/>}
          {loading?'Opening secure checkout…':availability==='loading'?'Checking checkout…':
           availability==='disabled'?'Checkout temporarily unavailable':'Unlock the full archive'}
          {!loading&&availability==='ready'&&<ArrowUpRight size={18}/>}
        </button>}
    </div>
    {testMode&&availability==='ready'&&!paid&&
      <p className="premium-note">TEST CHECKOUT · No real payment will be charged in test mode.</p>}
    <p className="premium-note">
      One-time purchase · No subscription · Instant unlock after verified payment.
      {' '}<Link href="/terms">Terms</Link> · <Link href="/refunds">Refund support</Link>
    </p>
    {availability==='disabled'&&!paid&&
      <p className="premium-note" role="status">Payments are being prepared. Your free discovery is still available.</p>}
    {error&&<p className="form-error" role="alert">{error}</p>}
  </div>;
}
