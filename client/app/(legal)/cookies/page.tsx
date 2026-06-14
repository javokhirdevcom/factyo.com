'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

const UPDATED = { nl: '14 juni 2025', en: '14 June 2025' }

export default function CookiesPage() {
  const { lang, t } = useLanguage()
  const isNL = lang === 'nl'

  return (
    <article>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        {t('legal.cookies')}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {t('legal.lastUpdated')}: {isNL ? UPDATED.nl : UPDATED.en}
      </p>

      {isNL ? <CookiesNL /> : <CookiesEN />}

      <div className="mt-10 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {isNL
            ? 'Toezichthoudende autoriteit:'
            : 'Supervisory authority:'}{' '}
          <a
            href="https://www.autoriteitpersoonsgegevens.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            {isNL ? 'Autoriteit Persoonsgegevens' : 'Dutch Data Protection Authority (AP)'}
          </a>
        </p>
      </div>
    </article>
  )
}

function CookiesNL() {
  return (
    <>
      <p className="text-gray-700 text-sm leading-relaxed">
        Factyo gebruikt cookies en vergelijkbare technologieën om de website goed te laten werken en het gebruik te meten. Op deze pagina leest u precies welke cookies wij gebruiken en hoe u uw voorkeuren kunt aanpassen.
      </p>

      <Section title="1. Wat zijn cookies?">
        <p>Cookies zijn kleine tekstbestanden die door uw browser worden opgeslagen op uw apparaat wanneer u een website bezoekt. Ze worden gebruikt om uw sessie te onthouden, voorkeuren op te slaan en websitegebruik te meten.</p>
      </Section>

      <Section title="2. Welke cookies gebruiken wij?">
        <CookieTable
          headers={['Naam', 'Type', 'Doel', 'Bewaarduur', 'Toestemming?']}
          rows={[
            ['next-auth.session-token', 'Functioneel', 'Inlogstatus bijhouden', 'Sessie / 30 dagen', 'Nee — noodzakelijk'],
            ['next-auth.csrf-token', 'Functioneel', 'Beveiliging (CSRF)', 'Sessie', 'Nee — noodzakelijk'],
            ['factyo-lang', 'Voorkeur', 'Taalvoorkeur opslaan', 'Persistent (localStorage)', 'Nee — functioneel'],
            ['factyo-cookie-consent', 'Functioneel', 'Cookievoorkeur opslaan', 'Persistent (localStorage)', 'Nee — noodzakelijk'],
            ['_ga, _ga_*', 'Analytisch', 'Websitegebruik meten (GA4)', '2 jaar', 'Ja — alleen na toestemming'],
          ]}
        />
      </Section>

      <Section title="3. Google Analytics en Consent Mode v2">
        <p>Wij gebruiken Google Analytics 4 (GA4) met Google Consent Mode v2:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Zonder toestemming:</strong> géén analytische cookies, géén persoonsgegevens naar Google</li>
          <li><strong>Met toestemming:</strong> sessie- en gebruiksgegevens worden anoniem gedeeld voor analyse</li>
          <li>Google verwerkt gegevens in de VS onder Standard Contractual Clauses (SCC)</li>
        </ul>
        <p className="mt-3">Meer informatie: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">privacybeleid van Google</a>.</p>
      </Section>

      <Section title="4. Uw cookievoorkeuren beheren">
        <Subsection title="4.1 Via de cookiebanner">
          <p>Bij uw eerste bezoek verschijnt een cookiebanner. U kunt kiezen voor "Alles accepteren" of "Alleen noodzakelijk".</p>
        </Subsection>
        <Subsection title="4.2 Toestemming intrekken">
          <p>Verwijder <code className="text-xs bg-gray-100 px-1 rounded">factyo-cookie-consent</code> uit uw browser-localStorage om uw voorkeur te resetten. De banner verschijnt dan opnieuw bij uw volgende bezoek.</p>
        </Subsection>
        <Subsection title="4.3 Via uw browser">
          <ul className="list-disc pl-5 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/nl/kb/cookies-in-firefox-verwijderen" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Microsoft Edge</a></li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">Let op: het blokkeren van noodzakelijke cookies kan invloed hebben op het inloggen.</p>
        </Subsection>
      </Section>

      <Section title="5. Meer informatie">
        <p>Zie onze <Link href="/privacy" className="text-pink-600 underline">Privacyverklaring</Link> of neem contact op via <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a>.</p>
      </Section>
    </>
  )
}

function CookiesEN() {
  return (
    <>
      <p className="text-gray-700 text-sm leading-relaxed">
        Factyo uses cookies and similar technologies to keep the website functioning correctly and to measure usage. This page explains exactly which cookies we use and how you can manage your preferences.
      </p>

      <Section title="1. What are cookies?">
        <p>Cookies are small text files stored by your browser on your device when you visit a website. They are used to remember your session, save preferences, and measure site usage.</p>
      </Section>

      <Section title="2. Which cookies do we use?">
        <CookieTable
          headers={['Name', 'Type', 'Purpose', 'Duration', 'Consent required?']}
          rows={[
            ['next-auth.session-token', 'Functional', 'Maintain login state', 'Session / 30 days', 'No — essential'],
            ['next-auth.csrf-token', 'Functional', 'Security (CSRF protection)', 'Session', 'No — essential'],
            ['factyo-lang', 'Preference', 'Remember language preference', 'Persistent (localStorage)', 'No — functional'],
            ['factyo-cookie-consent', 'Functional', 'Store cookie preference', 'Persistent (localStorage)', 'No — essential'],
            ['_ga, _ga_*', 'Analytics', 'Measure website usage (GA4)', '2 years', 'Yes — only after consent'],
          ]}
        />
      </Section>

      <Section title="3. Google Analytics and Consent Mode v2">
        <p>We use Google Analytics 4 (GA4) with Google Consent Mode v2:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Without consent:</strong> no analytics cookies are set, no personal data is sent to Google</li>
          <li><strong>With consent:</strong> session and usage data is shared anonymously for analysis</li>
          <li>Google processes data in the US under Standard Contractual Clauses (SCCs)</li>
        </ul>
        <p className="mt-3">More information: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Google Privacy Policy</a>.</p>
      </Section>

      <Section title="4. Managing your cookie preferences">
        <Subsection title="4.1 Via the cookie banner">
          <p>On your first visit a cookie banner appears. You can choose "Accept all" or "Only essential".</p>
        </Subsection>
        <Subsection title="4.2 Withdraw consent">
          <p>Delete <code className="text-xs bg-gray-100 px-1 rounded">factyo-cookie-consent</code> from your browser's localStorage to reset your preference. The banner will reappear on your next visit.</p>
        </Subsection>
        <Subsection title="4.3 Via your browser">
          <ul className="list-disc pl-5 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Microsoft Edge</a></li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">Note: blocking essential cookies may affect the ability to log in.</p>
        </Subsection>
      </Section>

      <Section title="5. More information">
        <p>See our <Link href="/privacy" className="text-pink-600 underline">Privacy Policy</Link> or contact us at <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a>.</p>
      </Section>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
      <div className="text-gray-700">{children}</div>
    </div>
  )
}

function CookieTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700 border border-gray-200">
                  {j === 0 ? <code className="bg-gray-100 px-1 rounded">{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
