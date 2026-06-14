'use client'

import { useLanguage } from '@/lib/i18n/LanguageProvider'

const UPDATED = { nl: '14 juni 2025', en: '14 June 2025' }
const EMAIL = 'info@factyo.com'

export default function TermsPage() {
  const { lang, t } = useLanguage()
  const isNL = lang === 'nl'

  return (
    <article>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        {t('legal.terms')}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {t('legal.lastUpdated')}: {isNL ? UPDATED.nl : UPDATED.en}
      </p>

      {isNL ? <TermsNL /> : <TermsEN />}

      <div className="mt-10 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {isNL ? 'Vragen? Neem contact op via' : 'Questions? Contact us at'}{' '}
          <a href={`mailto:${EMAIL}`} className="underline hover:text-gray-600">{EMAIL}</a>
        </p>
      </div>
    </article>
  )
}

function TermsNL() {
  return (
    <>
      <Section title="1. Definities">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Dienst:</strong> de online factureringsdienst aangeboden via factyo.com</li>
          <li><strong>Factyo:</strong> de aanbieder van de Dienst</li>
          <li><strong>Gebruiker:</strong> iedere persoon die een account aanmaakt en de Dienst gebruikt</li>
          <li><strong>Abonnement:</strong> een betaald plan (Basis of Onbeperkt) met uitgebreide functies</li>
        </ul>
      </Section>

      <Section title="2. Toepasselijkheid">
        <p>Deze Algemene Voorwaarden zijn van toepassing op elk gebruik van de Dienst. Door een account aan te maken gaat u akkoord met deze voorwaarden.</p>
      </Section>

      <Section title="3. De Dienst">
        <p>Factyo biedt een webapplicatie waarmee Gebruikers professionele facturen kunnen aanmaken, beheren en versturen, klantgegevens opslaan, PDF's downloaden en inkomstenrapportages inzien.</p>
        <p className="mt-2">Factyo vervangt geen accountant of fiscaal adviseur. De Gebruiker is zelf verantwoordelijk voor de fiscale juistheid van aangemaakt facturen.</p>
      </Section>

      <Section title="4. Abonnement en betaling">
        <Subsection title="4.1 Gratis plan">
          <p>Nieuwe Gebruikers ontvangen gratis toegang tot maximaal 3 facturen zonder tijdslimiet.</p>
        </Subsection>
        <Subsection title="4.2 Betaalde abonnementen">
          <p>Betaalde abonnementen (Basis en Onbeperkt) worden maandelijks vooraf gefactureerd via Stripe. Actuele prijzen staan op de <a href="/pricing" className="text-pink-600 underline">prijzenpagina</a>.</p>
        </Subsection>
        <Subsection title="4.3 Automatische verlenging">
          <p>Abonnementen worden automatisch verlengd tenzij u vóór de verlengingsdatum opzegt.</p>
        </Subsection>
      </Section>

      <Section title="5. Opzegging en terugbetaling">
        <Subsection title="5.1 Opzegging">
          <p>U kunt uw abonnement op elk moment opzeggen via <strong>Instellingen → Abonnement</strong>. U behoudt toegang tot het einde van de betaalperiode. Er vindt geen pro-rata restitutie plaats.</p>
        </Subsection>
        <Subsection title="5.2 Retourbeleid">
          <p>Digitale diensten vallen conform Art. 16(m) van Richtlijn 2011/83/EU buiten het herroepingsrecht, omdat de dienst onmiddellijk beschikbaar wordt gesteld. Bij technische storingen kunt u contact opnemen met <a href="mailto:info@factyo.com" className="text-pink-600 underline">info@factyo.com</a>.</p>
        </Subsection>
        <Subsection title="5.3 Verwijdering van account">
          <p>Stuur een e-mail naar <a href="mailto:info@factyo.com" className="text-pink-600 underline">info@factyo.com</a>. Factuurgegevens worden conform de fiscale bewaarplicht van 7 jaar bewaard.</p>
        </Subsection>
      </Section>

      <Section title="6. Verplichtingen van de Gebruiker">
        <ul className="list-disc pl-5 space-y-1">
          <li>U gebruikt de Dienst uitsluitend voor wettige zakelijke doeleinden</li>
          <li>U bent verantwoordelijk voor de juistheid van ingevoerde gegevens</li>
          <li>U bewaart uw inloggegevens vertrouwelijk</li>
          <li>U maakt geen misbruik van de Dienst of de infrastructuur</li>
        </ul>
      </Section>

      <Section title="7. Intellectueel eigendom">
        <p>Alle intellectuele eigendomsrechten op de Dienst berusten bij Factyo. De door u ingevoerde gegevens blijven uw eigendom. U verleent Factyo een beperkte licentie om deze gegevens uitsluitend ten behoeve van de Dienst te verwerken.</p>
      </Section>

      <Section title="8. Aansprakelijkheid">
        <p>Factyo is niet aansprakelijk voor indirecte schade of gevolgschade. De totale aansprakelijkheid is beperkt tot het bedrag dat de Gebruiker in de 3 maanden voorafgaand aan het schadegeval heeft betaald.</p>
      </Section>

      <Section title="9. Toepasselijk recht en geschillen">
        <p>Nederlands recht is van toepassing. Geschillen worden voorgelegd aan de bevoegde rechtbank in Amsterdam. U kunt ook gebruik maken van het <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">EU Online Dispute Resolution platform</a>.</p>
      </Section>

      <Section title="10. Wijzigingen">
        <p>Bij wezenlijke wijzigingen informeren wij u minimaal 30 dagen van tevoren per e-mail. Door de Dienst te blijven gebruiken accepteert u de gewijzigde voorwaarden.</p>
      </Section>
    </>
  )
}

function TermsEN() {
  return (
    <>
      <Section title="1. Definitions">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Service:</strong> the online invoicing service provided at factyo.com</li>
          <li><strong>Factyo:</strong> the provider of the Service</li>
          <li><strong>User:</strong> any person who creates an account and uses the Service</li>
          <li><strong>Subscription:</strong> a paid plan (Basic or Unlimited) with extended features</li>
        </ul>
      </Section>

      <Section title="2. Applicability">
        <p>These Terms & Conditions apply to all use of the Service. By creating an account you agree to these terms.</p>
      </Section>

      <Section title="3. The Service">
        <p>Factyo provides a web application for creating, managing, and sending professional invoices, storing client details, downloading PDFs, and viewing revenue reports.</p>
        <p className="mt-2">Factyo does not replace an accountant or tax advisor. The User is solely responsible for the fiscal accuracy of invoices created.</p>
      </Section>

      <Section title="4. Subscription and payment">
        <Subsection title="4.1 Free plan">
          <p>New users get free access for up to 3 invoices with no time limit.</p>
        </Subsection>
        <Subsection title="4.2 Paid subscriptions">
          <p>Paid plans (Basic and Unlimited) are billed monthly in advance via Stripe. Current pricing is on the <a href="/pricing" className="text-pink-600 underline">pricing page</a>.</p>
        </Subsection>
        <Subsection title="4.3 Automatic renewal">
          <p>Subscriptions renew automatically unless cancelled before the renewal date.</p>
        </Subsection>
      </Section>

      <Section title="5. Cancellation and refunds">
        <Subsection title="5.1 Cancellation">
          <p>Cancel at any time via <strong>Settings → Subscription</strong>. Access continues until the end of the billing period. No pro-rata refunds are issued.</p>
        </Subsection>
        <Subsection title="5.2 Refund policy">
          <p>Digital services are excluded from the right of withdrawal under Art. 16(m) of Directive 2011/83/EU, as the service is made available immediately upon purchase. Contact <a href="mailto:info@factyo.com" className="text-pink-600 underline">info@factyo.com</a> for service disruption issues.</p>
        </Subsection>
        <Subsection title="5.3 Account deletion">
          <p>Email <a href="mailto:info@factyo.com" className="text-pink-600 underline">info@factyo.com</a> to delete your account. Invoice data is retained for 7 years per Dutch tax law.</p>
        </Subsection>
      </Section>

      <Section title="6. User obligations">
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Service only for lawful business purposes</li>
          <li>You are responsible for the accuracy of data you enter</li>
          <li>Keep your login credentials confidential</li>
          <li>Do not misuse the Service or its infrastructure</li>
        </ul>
      </Section>

      <Section title="7. Intellectual property">
        <p>All intellectual property rights in the Service belong to Factyo. Data you enter (clients, invoice content) remains your property. You grant Factyo a limited licence to process this data solely to provide the Service.</p>
      </Section>

      <Section title="8. Liability">
        <p>Factyo is not liable for indirect or consequential damages. Total liability is limited to the amount paid by the User in the 3 months preceding the damage event.</p>
      </Section>

      <Section title="9. Governing law and disputes">
        <p>Dutch law applies. Disputes are submitted to the competent court in Amsterdam. You may also use the <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">EU Online Dispute Resolution platform</a>.</p>
      </Section>

      <Section title="10. Changes">
        <p>We will notify you by email at least 30 days before material changes take effect. Continuing to use the Service after the effective date constitutes acceptance of the updated terms.</p>
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
