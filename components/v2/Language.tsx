'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
type Language='en'|'hi';
type LanguageContextValue={lang:Language; setLang:(value:Language)=>void; tr:(en:string,hi:string)=>string};
const LanguageContext=createContext<LanguageContextValue|null>(null);

export function LanguageProvider({children}:{children:React.ReactNode}){
  const [lang,setLanguage]=useState<Language>('en');
  useEffect(()=>{
    try {
      const saved=window.localStorage.getItem('ayr:language');
      if(saved==='hi')setLanguage('hi');
    }catch{/* Storage can be disabled */}
  },[]);
  const setLang=useCallback((value:Language)=>{
    setLanguage(value);
    try{localStorage.setItem('ayr:language',value);}catch{/* Optional persistence */}
  },[]);
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  const tr=useCallback((en:string,hi:string)=>lang==='hi'?hi:en,[lang]);
  const context=useMemo(()=>({lang,setLang,tr}),[lang,setLang,tr]);
  return <LanguageContext.Provider value={context}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){
  const value=useContext(LanguageContext);
  if(!value)throw new Error('LanguageProvider is required');
  return value;
}
export function LanguageToggle(){
  const {lang,setLang}=useLanguage();
  return <div className="language-toggle" role="group" aria-label="Choose language / भाषा चुनें">
    <button type="button" lang="en" aria-pressed={lang==='en'} className={lang==='en'?'selected':''} onClick={()=>setLang('en')}>EN</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="hi" aria-pressed={lang==='hi'} className={lang==='hi'?'selected':''} onClick={()=>setLang('hi')}>हिंदी</button>
  </div>;
}
