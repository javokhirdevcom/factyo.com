import SessionProvider from '@/components/providers/session.provider'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { Toaster } from '@/components/ui/sonner'
import { ChildProps } from '@/types'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { FC } from 'react'
import './globals.css'

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
			<html lang='en' className={`${montserrat.variable} h-full antialiased`}>
				<body className={montserrat.className}>
					<LanguageProvider>
						{children}
						<Toaster richColors position='top-right' />
					</LanguageProvider>
				</body>
			</html>
		</SessionProvider>
	)
}

export default RootLayout
