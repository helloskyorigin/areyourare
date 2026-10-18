'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { parseBirthday } from '@/lib/birthday';

export function BirthdayForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [value,setValue] = useState('');
  const [error,setError] = useState('');
  const max = new Date().toISOString().slice(0,10);
  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseBirthday(value);
    if (!parsed) {setError('Please choose a real birth date between 1900 and today.');return;}
    setError('');
    router.push('/searching?date='+encodeURIComponent(parsed.iso));
  }
  return <form id={compact ? undefined : 'birthday-form'} className={'birthday-form '+(compact?'birthday-form-compact':'')} onSubmit={submit}>
    <label htmlFor={compact?'date-discover':'date-hero'}><CalendarDays size={17}/> Your date of birth</label>
    <div className="birthday-fields"><input type="date" id={compact?'date-discover':'date-hero'} value={value}
      min="1900-01-01" max={max} required aria-invalid={Boolean(error)} onChange={e=>{setValue(e.target.value);setError('');}}/>
      <button type="submit" className="button-primary">Discover my day <ArrowUpRight size={19}/></button></div>
    {error ? <p className="form-error" role="alert">{error}</p> : <p className="form-caption">✦ Your first discovery is free · No sign-up needed</p>}
  </form>;
}
