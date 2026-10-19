'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check,LockKeyhole,LoaderCircle } from 'lucide-react';
import { useLanguage } from '@/components/v2/Language';

export function PremiumCTA({date,paid}:{date:string;paid:boolean}){
 const {tr}=useLanguage();
 const [loading,setLoading]=useState(false);
 const [available,setAvailable]=useState<'loading'|'ready'|'disabled'>('loading');
 const [testMode,setTestMode]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  const ctrl=new AbortController();
  fetch('/api/checkout-availability',{signal:ctrl.signal,cache:'no-store'})
   .then(res=>res.json())
   .then((data:{available?:boolean;testMode?:boolean})=>{
    if(ctrl.signal.aborted)return;
    setAvailable(data.available?'ready':'disabled');setTestMode(data.testMode===true);
   }).catch(()=>{if(!ctrl.signal.aborted)setAvailable('disabled');});
  return()=>ctrl.abort();
 },[]);
 async function checkout(){
  if(loading||available!=='ready')return;
  setLoading(true);setError('');
  try{
   const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date})});
   const data=await res.json() as {checkoutUrl?:string;error?:string};
   if(!res.ok||!data.checkoutUrl)throw new Error(data.error||tr('Checkout unavailable.','भुगतान अभी उपलब्ध नहीं है।'));
   const url=new URL(data.checkoutUrl);
   if(url.protocol!=='https:'||!(url.hostname==='dodopayments.com'||url.hostname.endsWith('.dodopayments.com')))
    throw new Error(tr('Invalid checkout destination.','भुगतान लिंक सही नहीं है।'));
   window.location.assign(url.toString());
  }catch(e){setError(e instanceof Error?e.message:tr('Please try again.','फिर कोशिश करें।'));setLoading(false);}
 }
 return <div className="premium premium2">
  <div className="premium2-tag">✳ {tr('UNLOCK YOUR COMPLETE HISTORY','पूरा इतिहास खोलें')}</div>
  <div className="premium2-price"><strong>$2</strong><span>{tr('one-time payment','सिर्फ़ एक बार भुगतान')}</span></div>
  <h2>{tr('One story is free.','एक कहानी मुफ़्त।')}<br/><em>{tr('The rest is yours.','बाकी सब आपका।')}</em></h2>
  <div className="premium2-benefits">
   <span><Check size={16}/>{tr('Full historical timeline','पूरी ऐतिहासिक समयरेखा')}</span>
   <span><Check size={16}/>{tr('Famous birthdays','इसी दिन जन्मे प्रसिद्ध लोग')}</span>
   <span><Check size={16}/>{tr('Complete downloadable report','पूरी रिपोर्ट डाउनलोड करें')}</span>
  </div>
  {paid?<Link className="button-primary premium2-button" href={'/capsule?date='+encodeURIComponent(date)}>
    {tr('Open my report','मेरी रिपोर्ट खोलें')} <ArrowUpRight size={18}/>
  </Link>:
   <button type="button" onClick={checkout} className="button-primary premium2-button" disabled={loading||available!=='ready'}>
    {loading||available==='loading'?<LoaderCircle className="spin" size={18}/>:<LockKeyhole size={17}/>}
    {loading?tr('Opening payment…','भुगतान खुल रहा है…'):available==='loading'?tr('Checking checkout…','भुगतान जाँच रहे हैं…'):
     available==='disabled'?tr('Payment temporarily unavailable','भुगतान अभी उपलब्ध नहीं'):
     tr('Unlock full report — $2','पूरी रिपोर्ट खोलें — $2')}
    <ArrowUpRight size={18}/>
   </button>}
  <p className="premium2-assurance">{tr('Secure checkout · Instant access · No subscription','सुरक्षित भुगतान · तुरंत एक्सेस · कोई सब्सक्रिप्शन नहीं')}</p>
  {testMode&&available==='ready'&&!paid&&<p className="premium2-warning">{tr('TEST MODE — No live charge','टेस्ट मोड — असली भुगतान नहीं होगा')}</p>}
  {available==='disabled'&&!paid&&<p className="form-error" role="status">{tr('Checkout is being prepared.','भुगतान सुविधा तैयार हो रही है।')}</p>}
  {error&&<p className="form-error" role="alert">{error}</p>}
 </div>;
}
