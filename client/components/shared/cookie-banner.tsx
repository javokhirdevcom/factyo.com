'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { readStoredConsent, saveConsent, updateGtagConsent } from '@/lib/gtag'

export function CookieBanner() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = readStoredConsent()
    if (stored === null) {
      setVisible(true)
    } else {
      // Restore consent state for returning visitors
      updateGtagConsent(stored === 'granted')
    }
  }, [])

  function accept() {
    saveConsent(true)
    setVisible(false)
  }

  function reject() {
    saveConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('cookie.title')}
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-bold text-gray-900 text-sm leading-snug">
            🍪 {t('cookie.title')}
          </p>
          <button
            onClick={reject}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">
          {t('cookie.body')}{' '}
          <Link
            href="/cookies"
            className="underline hover:text-gray-800 transition-colors"
          >
            {t('cookie.learnMore')}
          </Link>
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={reject}
            className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
          >
            {t('cookie.reject')}
          </button>
          <button
            onClick={accept}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl factyo-gradient hover:opacity-90 transition-opacity"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
