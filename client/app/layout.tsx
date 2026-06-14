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

export const metadata: Metadata = {
	title: 'Factyo — Effortless Invoicing for Freelancers',
	description:
		'Create, send, and manage professional invoices in minutes. Built for Dutch freelancers (ZZP) who want to get paid faster. Includes VAT, KvK, IBAN and PDF invoices.',
	keywords: ['invoice', 'invoicing', 'factuur', 'ZZP', 'freelancer', 'Netherlands', 'facturen', 'BTW', 'KvK'],
	authors: [{ name: 'Factyo' }],
	robots: { index: true, follow: true },
	icons: { icon: '/favicon.ico' },
	openGraph: {
		title: 'Factyo — Effortless Invoicing for Freelancers',
		description: 'Create professional invoices, send them by email, and get paid faster. The invoicing tool built for Dutch freelancers.',
		type: 'website',
		locale: 'en_US',
		siteName: 'Factyo',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Factyo — Effortless Invoicing for Freelancers',
		description: 'Create professional invoices, send them by email, and get paid faster.',
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
