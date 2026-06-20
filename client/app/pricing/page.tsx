'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Check, FileText, Star, ArrowRight, Zap, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createCheckoutSessionAction } from '@/actions/stripe.action'

const plans = [
	{
		key: 'free',
		nameKey: 'settings.planFree',
		price: '€0',
		perKey: 'pricing.forever',
		descKey: 'pricing.descFree',
		featureKeys: ['pricing.feat3invoices', 'pricing.featPdf', 'pricing.featEmail', 'pricing.featClients', 'pricing.featProfile'],
		ctaKey: 'pricing.getStartedFree',
		href: '/register',
		highlight: false,
		stripe: false,
	},
	{
		key: 'basic',
		nameKey: 'settings.planBasic',
		price: '€7.95',
		perKey: 'pricing.perMonth',
		descKey: 'pricing.descBasic',
		featureKeys: ['pricing.feat10invoices', 'pricing.featPdf', 'pricing.featEmail', 'pricing.featClients', 'pricing.featProfile', 'pricing.featSupport'],
		ctaKey: 'pricing.choosePlan',
		href: '#',
		highlight: false,
		stripe: true,
	},
	{
		key: 'unlimited',
		nameKey: 'settings.planUnlimited',
		price: '€12.50',
		perKey: 'pricing.perMonth',
		descKey: 'pricing.descUnlimited',
		featureKeys: ['pricing.featUnlimited', 'pricing.featPdf', 'pricing.featEmail', 'pricing.featClients', 'pricing.featProfile', 'pricing.featSupport', 'pricing.featPortal'],
		ctaKey: 'pricing.choosePlan',
		href: '#',
		highlight: true,
		stripe: true,
	},
]

export default function PricingPage() {
	const { t } = useLanguage()
	const { data: session } = useSession()
	const [loading, setLoading] = useState<string | null>(null)

	const currentPlan = (session as any)?.currentUser?.plan ?? null

	const handlePlan = async (planKey: string) => {
		if (!session) {
			toast.error('Please log in to upgrade your plan.')
			return
		}
		setLoading(planKey)
		const userId = (session as any).currentUser?._id || session.user?.id
		if (!userId) {
			toast.error('Session expired — please log out and log in again.')
			setLoading(null)
			return
		}
		const res = await createCheckoutSessionAction({ userId, plan: planKey })
		if (res?.data?.success && res.data.url) {
			window.location.href = res.data.url
		} else if (res?.data?.failure) {
			toast.error(res.data.failure)
			setLoading(null)
		} else if (res?.serverError) {
			toast.error('Server error: ' + res.serverError)
			setLoading(null)
		} else {
			toast.error(t('common.error'))
			setLoading(null)
		}
	}

	return (
		<div className='min-h-screen bg-white'>
			{/* NAV */}
			<header className='fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100'>
				<div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
					<Link href='/' className='flex items-center gap-2'>
						<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center'>
							<FileText className='w-4 h-4 text-white' />
						</div>
						<span className='font-extrabold text-xl tracking-tight'>
							Fact<span style={{ color: '#FF2D78' }}>yo</span>
						</span>
					</Link>
					<div className='flex items-center gap-3'>
						{session ? (
							<Link href='/dashboard' className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'>
								{t('nav.dashboard')} <ArrowRight className='w-4 h-4' />
							</Link>
						) : (
							<>
								<Link href='/login' className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'>
									{t('auth.login.submit')}
								</Link>
								<Link href='/register' className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'>
									{t('pricing.getStartedFree')}
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			<div className='pt-28 pb-24 px-6'>
				<div className='max-w-4xl mx-auto'>
					{/* Header */}
					<div className='text-center mb-16 space-y-4'>
						<span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border' style={{ borderColor: 'rgba(255,45,120,0.4)', color: '#FF2D78', background: 'rgba(255,45,120,0.1)' }}>
							<Zap className='w-3 h-3' /> {t('pricing.simple')}
						</span>
						<h1 className='text-5xl font-extrabold tracking-tight text-gray-900'>
							{t('pricing.title')}
						</h1>
						<p className='text-gray-500 text-xl max-w-xl mx-auto'>
							{t('pricing.subtitle')}
						</p>
					</div>

					{/* Plans */}
					<div className='grid md:grid-cols-3 gap-6'>
						{plans.map(plan => {
							const isCurrentPlan = currentPlan === plan.key
							const isDowngrade = currentPlan && plan.key === 'free' && currentPlan !== 'free'

							return (
								<div
									key={plan.key}
									className={`relative rounded-2xl p-7 border flex flex-col ${
										plan.highlight
											? 'border-transparent shadow-2xl text-white'
											: 'border-gray-200 bg-white shadow-sm'
									} ${isCurrentPlan ? 'ring-2 ring-offset-2 ring-pink-500' : ''}`}
									style={plan.highlight ? { background: 'linear-gradient(135deg, #FF2D78 0%, #c1002d 100%)' } : {}}
								>
									{plan.highlight && !isCurrentPlan && (
										<span className='absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1 whitespace-nowrap'>
											<Star className='w-3 h-3 fill-current' /> {t('pricing.mostPopular')}
										</span>
									)}
									{isCurrentPlan && (
										<span className='absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1 whitespace-nowrap'>
											<BadgeCheck className='w-3 h-3' /> {t('pricing.currentPlanLabel')}
										</span>
									)}

									<div className='mb-6'>
										<h3 className={`font-bold text-xl mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
											{t(plan.nameKey)}
										</h3>
										<div className='flex items-baseline gap-1 mb-2'>
											<span className={`text-5xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
												{plan.price}
											</span>
											<span className={`text-sm font-medium ${plan.highlight ? 'text-white/70' : 'text-gray-400'}`}>
												{t(plan.perKey)}
											</span>
										</div>
										<p className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>
											{t(plan.descKey)}
										</p>
									</div>

									<ul className='space-y-3 mb-8 flex-1'>
										{plan.featureKeys.map(fk => (
											<li key={fk} className='flex items-start gap-2.5 text-sm'>
												<Check className='w-4 h-4 shrink-0 mt-0.5' style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#FF2D78' }} />
												<span className={plan.highlight ? 'text-white/90' : 'text-gray-600'}>{t(fk)}</span>
											</li>
										))}
									</ul>

									{isCurrentPlan ? (
										<div className={`w-full py-3 rounded-xl text-sm font-bold text-center ${plan.highlight ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
											{t('pricing.currentPlanLabel')}
										</div>
									) : isDowngrade ? (
										<Link
											href='/dashboard/settings'
											className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900`}
										>
											{t('pricing.manageSettings')}
										</Link>
									) : plan.stripe ? (
										<button
											onClick={() => handlePlan(plan.key)}
											disabled={loading === plan.key}
											className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
												plan.highlight
													? 'bg-white text-gray-900 hover:bg-gray-100'
													: 'factyo-gradient text-white hover:opacity-90'
											}`}
										>
											{loading === plan.key ? t('pricing.redirecting') : t(plan.ctaKey)}
										</button>
									) : (
										<Link
											href={plan.href}
											className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all border ${
												plan.highlight
													? 'bg-white text-gray-900 hover:bg-gray-100 border-transparent'
													: 'border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900'
											}`}
										>
											{t(plan.ctaKey)}
										</Link>
									)}
								</div>
							)
						})}
					</div>

					<p className='text-center text-sm text-gray-400 mt-10'>
						{t('pricing.cancelAnytime')}
					</p>
				</div>
			</div>
		</div>
	)
}
