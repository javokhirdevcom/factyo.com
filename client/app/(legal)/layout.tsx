'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Fact<span style={{ color: '#FF2D78' }}>yo</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← {t('legal.backToHome')}
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-gray-100 py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400 justify-center">
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">{t('legal.privacy')}</Link>
          <Link href="/terms" className="hover:text-gray-700 transition-colors">{t('legal.terms')}</Link>
          <Link href="/cookies" className="hover:text-gray-700 transition-colors">{t('legal.cookies')}</Link>
          <span>&copy; {new Date().getFullYear()} Factyo</span>
        </div>
      </footer>
    </div>
  )
}
