'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

const UPDATED = { nl: '14 juni 2025', en: '14 June 2025' }
const EMAIL = 'privacy@factyo.com'

export default function PrivacyPage() {
  const { lang, t } = useLanguage()
  const isNL = lang === 'nl'

  return (
    <article>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        {t('legal.privacy')}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {t('legal.lastUpdated')}: {isNL ? UPDATED.nl : UPDATED.en}
      </p>

      {isNL ? <PrivacyNL /> : <PrivacyEN />}

      <div className="mt-10 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {isNL ? 'Vragen? Neem contact op via' : 'Questions? Contact us at'}{' '}
          <a href={`mailto:${EMAIL}`} className="underline hover:text-gray-600">{EMAIL}</a>
        </p>
      </div>
    </article>
  )
}

function PrivacyNL() {
  return (
    <>
      <Section title="1. Wie zijn wij?">
        <p>Factyo is een online factureringsdienst voor zelfstandige ondernemers en ZZP'ers in Nederland. Wij zijn de verwerkingsverantwoordelijke voor de persoonsgegevens die u aan ons verstrekt in de zin van de AVG (GDPR).</p>
        <p className="mt-2"><strong>Contact:</strong> <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a></p>
      </Section>

      <Section title="2. Welke gegevens verzamelen wij?">
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld)</li>
          <li><strong>Bedrijfsgegevens:</strong> bedrijfsnaam, KvK-nummer, BTW-nummer, IBAN, BIC, adres</li>
          <li><strong>Factuurgegevens:</strong> klantgegevens die u invoert om facturen aan te maken</li>
          <li><strong>Betalingsgegevens:</strong> verwerkt via Stripe — wij slaan geen volledige betaalkaartgegevens op</li>
          <li><strong>Gebruiksgegevens:</strong> IP-adres, browser-type, bezochte pagina's (via Google Analytics, alleen met uw toestemming)</li>
        </ul>
      </Section>

      <Section title="3. Waarvoor gebruiken wij uw gegevens?">
        <DataTable
          headers={['Doel', 'Verwerking', 'Rechtsgrond']}
          rows={[
            ['Account beheer', 'Account aanmaken en onderhouden', 'Art. 6(1)(b) AVG — uitvoering overeenkomst'],
            ['Betalingsverwerking', 'Abonnementsbetalingen via Stripe', 'Art. 6(1)(b) AVG — uitvoering overeenkomst'],
            ['E-mailcommunicatie', 'Facturen, OTP-codes, systeemberichten', 'Art. 6(1)(b) AVG — uitvoering overeenkomst'],
            ['Website-analyse', 'Meten van websitegebruik (GA4)', 'Art. 6(1)(a) AVG — toestemming'],
            ['Wettelijke verplichtingen', 'Boekhoudkundige bewaarplicht (7 jaar)', 'Art. 6(1)(c) AVG — wettelijke verplichting'],
          ]}
        />
      </Section>

      <Section title="4. Hoe lang bewaren wij uw gegevens?">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Accountgegevens:</strong> zolang uw account actief is, plus 2 jaar na verwijdering</li>
          <li><strong>Factuurgegevens:</strong> 7 jaar (fiscale bewaartermijn)</li>
          <li><strong>Betalingsgegevens:</strong> conform Stripe-retentiebeleid (doorgaans 5 jaar)</li>
          <li><strong>Analysegegevens:</strong> maximaal 14 maanden</li>
        </ul>
      </Section>

      <Section title="5. Met wie delen wij uw gegevens?">
        <DataTable
          headers={['Verwerker', 'Doel', 'Locatie']}
          rows={[
            ['Stripe, Inc.', 'Betalingsverwerking', 'VS (SCC)'],
            ['Google LLC', 'Website-analyse (GA4)', 'VS (SCC)'],
            ['Vercel Inc.', 'Hosting', 'VS (SCC)'],
            ['UploadThing', 'Logo-opslag', 'VS (SCC)'],
          ]}
        />
        <p className="mt-3 text-xs text-gray-500">Wij verkopen uw persoonsgegevens nooit aan derden.</p>
      </Section>

      <Section title="6. Uw rechten onder de AVG">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Inzage (Art. 15):</strong> opvragen welke gegevens wij verwerken</li>
          <li><strong>Rectificatie (Art. 16):</strong> onjuiste gegevens laten corrigeren</li>
          <li><strong>Verwijdering (Art. 17):</strong> "recht om vergeten te worden"</li>
          <li><strong>Beperking (Art. 18):</strong> verwerking laten beperken</li>
          <li><strong>Overdraagbaarheid (Art. 20):</strong> gegevens in machineleesbaar formaat opvragen</li>
          <li><strong>Bezwaar (Art. 21):</strong> bezwaar maken tegen verwerking</li>
          <li><strong>Toestemming intrekken (Art. 7(3)):</strong> cookietoestemming altijd intrekken</li>
        </ul>
        <p className="mt-3">Verzoeken sturen naar <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a>. Wij reageren binnen 30 dagen. U kunt ook een klacht indienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Autoriteit Persoonsgegevens</a>.</p>
      </Section>

      <Section title="7. Cookies">
        <p>Wij gebruiken functionele cookies en, met uw toestemming, analytische cookies. Lees ons <Link href="/cookies" className="text-pink-600 underline">Cookiebeleid</Link> voor meer informatie.</p>
      </Section>

      <Section title="8. Beveiliging">
        <p>Wij passen HTTPS-encryptie, bcrypt-wachtwoordhashing en toegangscontroles toe. Bij een datalek dat uw rechten in gevaar brengt, informeren wij u binnen 72 uur (Art. 33 en 34 AVG).</p>
      </Section>

      <Section title="9. Wijzigingen">
        <p>Bij wezenlijke wijzigingen informeren wij u per e-mail. De meest recente versie staat altijd op deze pagina.</p>
      </Section>
    </>
  )
}

function PrivacyEN() {
  return (
    <>
      <Section title="1. Who we are">
        <p>Factyo is an online invoicing service for freelancers and independent contractors, primarily serving the Netherlands. We are the data controller for the personal data you provide us, as defined by the General Data Protection Regulation (GDPR).</p>
        <p className="mt-2"><strong>Contact:</strong> <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a></p>
      </Section>

      <Section title="2. What data we collect">
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Account data:</strong> full name, email address, password (encrypted)</li>
          <li><strong>Business data:</strong> business name, Chamber of Commerce number, VAT number, IBAN, BIC, address</li>
          <li><strong>Invoice data:</strong> client details you enter to create invoices</li>
          <li><strong>Payment data:</strong> processed by Stripe — we never store full card details</li>
          <li><strong>Usage data:</strong> IP address, browser type, pages visited (via Google Analytics, only with your consent)</li>
        </ul>
      </Section>

      <Section title="3. How we use your data">
        <DataTable
          headers={['Purpose', 'Processing', 'Legal basis']}
          rows={[
            ['Account management', 'Create and maintain your account', 'Art. 6(1)(b) GDPR — contract performance'],
            ['Payment processing', 'Monthly subscription payments via Stripe', 'Art. 6(1)(b) GDPR — contract performance'],
            ['Email communication', 'Invoices, OTP codes, system messages', 'Art. 6(1)(b) GDPR — contract performance'],
            ['Website analytics', 'Measuring usage to improve the service (GA4)', 'Art. 6(1)(a) GDPR — consent'],
            ['Legal obligations', 'Accounting record retention (7 years)', 'Art. 6(1)(c) GDPR — legal obligation'],
          ]}
        />
      </Section>

      <Section title="4. How long we keep your data">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account data:</strong> for as long as your account is active, plus 2 years after deletion</li>
          <li><strong>Invoice data:</strong> 7 years (Dutch Tax Authority retention requirement)</li>
          <li><strong>Payment data:</strong> per Stripe's retention policy (typically 5 years)</li>
          <li><strong>Analytics data:</strong> maximum 14 months</li>
        </ul>
      </Section>

      <Section title="5. Who we share your data with">
        <DataTable
          headers={['Processor', 'Purpose', 'Location']}
          rows={[
            ['Stripe, Inc.', 'Payment processing', 'US (Standard Contractual Clauses)'],
            ['Google LLC', 'Website analytics (GA4)', 'US (Standard Contractual Clauses)'],
            ['Vercel Inc.', 'Application hosting', 'US (Standard Contractual Clauses)'],
            ['UploadThing', 'Logo file storage', 'US (Standard Contractual Clauses)'],
          ]}
        />
        <p className="mt-3 text-xs text-gray-500">We never sell your personal data to third parties.</p>
      </Section>

      <Section title="6. Your rights under GDPR">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Right of access (Art. 15):</strong> request a copy of your personal data</li>
          <li><strong>Right to rectification (Art. 16):</strong> correct inaccurate data</li>
          <li><strong>Right to erasure (Art. 17):</strong> request deletion ("right to be forgotten")</li>
          <li><strong>Right to restriction (Art. 18):</strong> limit how we process your data</li>
          <li><strong>Right to data portability (Art. 20):</strong> receive your data in a machine-readable format</li>
          <li><strong>Right to object (Art. 21):</strong> object to processing based on legitimate interest</li>
          <li><strong>Right to withdraw consent (Art. 7(3)):</strong> withdraw cookie consent at any time</li>
        </ul>
        <p className="mt-3">Send requests to <a href="mailto:privacy@factyo.com" className="text-pink-600 underline">privacy@factyo.com</a>. We respond within 30 days. You also have the right to lodge a complaint with the <a href="https://www.autoriteitpersoonsgegevens.nl/en" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Dutch Data Protection Authority (AP)</a>.</p>
      </Section>

      <Section title="7. Cookies">
        <p>We use functional cookies and, with your consent, analytics cookies. Read our <Link href="/cookies" className="text-pink-600 underline">Cookie Policy</Link> for details.</p>
      </Section>

      <Section title="8. Security">
        <p>We apply HTTPS encryption, bcrypt password hashing, and access controls. In the event of a data breach that endangers your rights, we will notify you within 72 hours (Art. 33 and 34 GDPR).</p>
      </Section>

      <Section title="9. Changes">
        <p>We will notify you by email of any material changes. The most recent version is always available on this page.</p>
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

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700 border border-gray-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
