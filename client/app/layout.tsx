import SessionProvider from '@/components/providers/session.provider'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { Toaster } from '@/components/ui/sonner'
import { CookieBanner } from '@/components/shared/cookie-banner'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { ChildProps } from '@/types'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { FC } from 'react'
import './globals.css'

const GA_ID = 'G-RLWZRJCF44'

const montserrat = Montserrat({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800'],
	variable: '--font-montserrat',
})

const BASE_URL = 'https://www.factyo.com'

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		default: 'Factyo — Online Factureren voor ZZP & Freelancers',
		template: '%s | Factyo',
	},
	description:
		'Maak, verstuur en beheer professionele facturen in minuten. Speciaal voor Nederlandse ZZP\'ers en freelancers. Met BTW, KvK, IBAN en PDF-facturen. Gratis proberen.',
	keywords: [
		'facturen maken', 'online factureren', 'ZZP factuur', 'freelancer factuur',
		'factuurprogramma', 'boekhoudprogramma zzp', 'factuur versturen', 'BTW factuur',
		'invoicing software netherlands', 'invoice software freelancer', 'factyo',
	],
	authors: [{ name: 'Factyo', url: BASE_URL }],
	creator: 'Factyo',
	publisher: 'Factyo',
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
	},
	icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
	alternates: {
		canonical: BASE_URL,
		languages: { 'nl-NL': BASE_URL, 'en-US': `${BASE_URL}/en` },
	},
	openGraph: {
		title: 'Factyo — Online Factureren voor ZZP & Freelancers',
		description: 'Maak professionele facturen, verstuur ze per e-mail en word sneller betaald. De factuurtools voor Nederlandse ZZP\'ers.',
		type: 'website',
		locale: 'nl_NL',
		alternateLocale: ['en_US'],
		siteName: 'Factyo',
		url: BASE_URL,
		images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Factyo — Factureren voor ZZP' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Factyo — Online Factureren voor ZZP & Freelancers',
		description: 'Maak professionele facturen, verstuur ze per e-mail en word sneller betaald.',
		images: [`${BASE_URL}/og-image.png`],
	},
	verification: {
		google: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
	},
}

const RootLayout: FC<ChildProps> = ({ children }) => {
	return (
		<SessionProvider>
			<html lang='nl' className={`${montserrat.variable} h-full antialiased`}>
				<body className={montserrat.className}>
					{/* Google Consent Mode v2 — must run before GA loads */}
					<Script id="consent-init" strategy="beforeInteractive">{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('consent', 'default', {
							analytics_storage: 'denied',
							ad_storage: 'denied',
							ad_user_data: 'denied',
							ad_personalization: 'denied',
							wait_for_update: 500
						});
					`}</Script>

					{/* Google Analytics 4 */}
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
						strategy="afterInteractive"
					/>
					<Script id="ga-config" strategy="afterInteractive">{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${GA_ID}');
					`}</Script>

					<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							{
								'@type': 'SoftwareApplication',
								name: 'Factyo',
								url: 'https://www.factyo.com',
								applicationCategory: 'BusinessApplication',
								operatingSystem: 'Web',
								description: "Online facturensoftware voor ZZP'ers en freelancers in Nederland. Maak, verstuur en beheer BTW-facturen.",
								offers: [
									{ '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'EUR', description: '3 facturen gratis' },
									{ '@type': 'Offer', name: 'Basic', price: '8', priceCurrency: 'EUR', description: '10 facturen per maand' },
									{ '@type': 'Offer', name: 'Unlimited', price: '9.99', priceCurrency: 'EUR', description: 'Onbeperkt facturen' },
								],
								aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '47', bestRating: '5', worstRating: '1' },
								featureList: ['PDF facturen', 'E-mail verzending', 'BTW berekening', 'KvK & IBAN ondersteuning', 'Klantenbeheer'],
							},
							{
								'@type': 'Organization',
								name: 'Factyo',
								url: 'https://www.factyo.com',
								logo: 'https://www.factyo.com/logo.png',
								contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', availableLanguage: ['Dutch', 'English'] },
							},
						],
					})}} />
					<LanguageProvider>
						{children}
						<Toaster richColors position='top-right' />
						<CookieBanner />
						<WhatsAppButton />
					</LanguageProvider>

					{/* Vercel Web Analytics */}
					<Analytics />
				</body>
			</html>
		</SessionProvider>
	)
}

export default RootLayout
