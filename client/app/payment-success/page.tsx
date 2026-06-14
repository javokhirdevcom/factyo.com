'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { CheckCircle, ArrowRight, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function PaymentSuccessPage() {
	const { t } = useLanguage()
	const { update } = useSession()

	useEffect(() => {
		const timer = setTimeout(() => update(), 2000)
		return () => clearTimeout(timer)
	}, [update])

	return (
		<div className='min-h-screen flex flex-col items-center justify-center px-6' style={{ background: 'linear-gradient(160deg,#0d0819 0%,#1a0a2e 100%)' }}>
			<div className='max-w-md w-full text-center space-y-6'>
				<div className='w-20 h-20 rounded-full factyo-gradient flex items-center justify-center mx-auto shadow-lg' style={{ boxShadow: '0 0 40px rgba(255,45,120,0.4)' }}>
					<CheckCircle className='w-10 h-10 text-white' />
				</div>

				<div className='space-y-2'>
					<h1 className='text-3xl font-extrabold text-white'>{t('paymentSuccess.title')}</h1>
					<p className='text-white/60'>{t('paymentSuccess.subtitle')}</p>
				</div>

				<div className='bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-xl factyo-gradient flex items-center justify-center shrink-0'>
							<FileText className='w-5 h-5 text-white' />
						</div>
						<div>
							<p className='font-bold text-white text-sm'>{t('paymentSuccess.premium')}</p>
							<p className='text-white/50 text-xs'>{t('paymentSuccess.activated')}</p>
						</div>
					</div>
				</div>

				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
				>
					{t('paymentSuccess.goDashboard')} <ArrowRight className='w-4 h-4' />
				</Link>

				<p className='text-white/30 text-xs'>{t('paymentSuccess.emailSent')}</p>
			</div>
		</div>
	)
}
