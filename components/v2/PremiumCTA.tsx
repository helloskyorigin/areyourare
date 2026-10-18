'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, LockKeyhole, LoaderCircle } from 'lucide-react';
export function PremiumCTA({date,paid}:{date:string;paid:boolean}) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function checkout() {
    if (loading) return;
    setLoading(true);setError('');
    try {
      const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date})});
      const data=await res.json() as {checkoutUrl?:string;error?:string};
      if (!res.ok||!data.checkoutUrl) throw new Error(data.error||'Payment unavailable');
      const url=new URL(data.checkoutUrl);
      if (url.protocol!=='https:'||!(url.hostname==='dodopayments.com'||url.hostname.endsWith('.dodopayments.com'))) throw new Error('Invalid checkout URL');
      window.location.assign(url.toString());
    } catch(e) {setError(e instanceof Error?e.message:'Unable to start payment');setLoading(false);}
  }
  return <div className="premium">
    <div className="eyebrow">✳ YOUR BIRTHDAY TIME CAPSULE</div><h2>The first moment is only <em>the beginning.</em></h2>
    <p>Turn a single date into a beautifully curated, source-linked journey through history. More stories. More connections. A keepsake worth sharing.</p>
    <div className="premium-benefits"><span><Check size={15}/> Complete historical timeline</span><span><Check size={15}/> Famous birthday connections</span><span><Check size={15}/> Birth-year matches when available</span><span><Check size={15}/> Print-ready personal archive</span></div>
    <div className="premium-bottom"><strong>$2 <small>one time</small></strong>
      {paid?<Link href={'/capsule?date='+encodeURIComponent(date)} className="button-primary">Open my capsule <ArrowUpRight size={18}/></Link>:
      <button type="button" className="button-primary" onClick={checkout} disabled={loading}>
        {loading?<LoaderCircle className="spin" size={18}/>:<LockKeyhole size={17}/>} Unlock my capsule <ArrowUpRight size={18}/></button>}</div>
    <p className="premium-note">One-time payment · No subscription · Current-browser access</p>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
