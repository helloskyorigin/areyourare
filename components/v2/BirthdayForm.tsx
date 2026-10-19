'use client';
import { FormEvent,useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight,CalendarDays } from 'lucide-react';
import { parseBirthday } from '@/lib/birthday';
import { useLanguage } from '@/components/v2/Language';
export function BirthdayForm({compact=false}:{compact?:boolean}){
 const router=useRouter(),{tr}=useLanguage();
 const [value,setValue]=useState(''),[error,setError]=useState(false);
 const max=new Date().toISOString().slice(0,10);
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const parsed=parseBirthday(value);
  if(!parsed){setError(true);return;}
  setError(false);
  router.push('/searching?date='+encodeURIComponent(parsed.iso));
 }
 return <form id={compact?undefined:'birthday-form'} className={'birthday-form '+(compact?'birthday-form-compact':'')} onSubmit={submit}>
  <label htmlFor={compact?'date-discover':'date-hero'}><CalendarDays size={17}/>{tr('Your date of birth','आपकी जन्मतिथि')}</label>
  <div className="birthday-fields">
   <input type="date" id={compact?'date-discover':'date-hero'} min="1900-01-01" max={max} required value={value}
    aria-label={tr('Date of birth','जन्मतिथि')} aria-invalid={error}
    onChange={e=>{setValue(e.target.value);setError(false);}}/>
   <button type="submit" className="button-primary">{tr('Discover my day','मेरा दिन जानें')} <ArrowUpRight size={19}/></button>
  </div>
  {error?<p role="alert" className="form-error">{tr('Choose a valid birth date between 1900 and today.','1900 से आज तक की सही जन्मतिथि चुनें।')}</p>:
   <p className="form-caption">{tr('✦ First story free · No account needed','✦ पहली कहानी मुफ़्त · कोई अकाउंट नहीं चाहिए')}</p>}
 </form>;
}
