'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface LanguagePrefContextValue {
  preferredLang: string | null;
  setPreferredLang: (lang: string) => void;
}

export const LanguagePrefContext = createContext<LanguagePrefContextValue>({
  preferredLang: null,
  setPreferredLang: () => {},
});

export function LanguagePrefProvider({ children }: { children: ReactNode }) {
  const [preferredLang, setPreferredLangState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('algokube.preferredLang') || null; } catch { return null; }
  });

  const setPreferredLang = useCallback((lang: string) => {
    const norm = (lang || '').toLowerCase() || null;
    setPreferredLangState(norm);
    try { if (norm) localStorage.setItem('algokube.preferredLang', norm); } catch {}
  }, []);

  useEffect(() => {
    const h = (e: StorageEvent) => {
      if (e.key === 'algokube.preferredLang') setPreferredLangState(e.newValue);
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  return (
    <LanguagePrefContext.Provider value={{ preferredLang, setPreferredLang }}>
      {children}
    </LanguagePrefContext.Provider>
  );
}

export const useLanguagePref = () => useContext(LanguagePrefContext);
