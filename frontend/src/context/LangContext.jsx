import { createContext, useContext, useState } from 'react';

const STRINGS = {
  en: { home: 'Home', services: 'Services', listings: 'Listings', contact: 'Contact', enquire: 'Enquire' },
  ta: { home: 'முகப்பு', services: 'சேவைகள்', listings: 'சொத்துக்கள்', contact: 'தொடர்பு', enquire: 'விசாரிக்க' },
};

const LangContext = createContext({ lang: 'en', t: STRINGS.en, toggle: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('vitta_lang') || 'en');
  const toggle = () => {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    localStorage.setItem('vitta_lang', next);
  };
  return <LangContext.Provider value={{ lang, t: STRINGS[lang], toggle }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
