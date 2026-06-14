'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Lang, translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('factyo-lang') as Lang | null
    if (stored && stored in translations) setLangState(stored)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('factyo-lang', l)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const parts = key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = translations[lang]
      for (const p of parts) {
        val = val?.[p]
        if (val === undefined) break
      }
      if (typeof val === 'string') return val
      // Fallback to English
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallback: any = translations['en']
      for (const p of parts) {
        fallback = fallback?.[p]
        if (fallback === undefined) break
      }
      return typeof fallback === 'string' ? fallback : key
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
