import React, { createContext, useContext, useState } from 'react';
import { tr } from '../locales/tr';
import { en } from '../locales/en';
import { de } from '../locales/de';

type Language = 'tr' | 'en' | 'de';

const dictionaries = { tr, en, de };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'tr',
  setLanguage: () => {},
  t: (key) => tr[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('yare_language') as Language) || 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yare_language', lang);
  };

  const t = (key: keyof typeof en): string => {
    const dict = dictionaries[language] || tr;
    return (dict as any)[key] || (tr as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
