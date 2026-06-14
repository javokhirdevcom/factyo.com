'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import {
	ArrowRight,
	Check,
	FileText,
	Mail,
	Zap,
	CreditCard,
	Users,
	Star,
} from 'lucide-react'

const plans = [
	{
		nameKey: 'settings.planFree',
		price: '€0',
		perKey: 'pricing.forever',
		desc: 'Try Factyo with your first invoices.',
		features: ['3 invoices total', 'Email delivery', 'Client management', 'PDF download'],
		href: '/register',
		highlight: false,
	},
	{
		nameKey: 'settings.planBasic',
		price: '€8',
		perKey: 'pricing.perMonth',
		desc: 'Perfect for freelancers with regular clients.',
		features: ['10 invoices/month', 'Email delivery', 'Client management', 'PDF download', 'Priority support'],
		href: '/register',
		highlight: false,
	},
	{
		nameKey: 'settings.planUnlimited',
		price: '€9.99',
		perKey: 'pricing.perMonth',
		desc: 'For busy freelancers who invoice without limits.',
		features: ['Unlimited invoices', 'Email delivery', 'Client management', 'PDF download', 'Priority support', 'Billing portal'],
		href: '/register',
		highlight: true,
	},
]

export default function LandingPage() {
	const { t } = useLanguage()
	const { data: session } = useSession()

	const features = [
		{
			icon: FileText,
			title: 'Create Professional Invoices',
			desc: 'Add line items, hours, rates, and VAT. Your invoice looks polished every time.',
		},
		{
			icon: Mail,
			title: 'Send via Email Instantly',
			desc: 'Hit send and the client receives a beautiful HTML invoice directly in their inbox.',
		},
		{
			icon: Users,
			title: 'Manage Your Clients',
			desc: 'Keep all your client details in one place. Pick them from a list when invoicing.',
		},
		{
			icon: CreditCard,
			title: 'Include Payment Details',
			desc: 'Add your IBAN, BIC, and VAT number so clients can pay you without guessing.',
		},
	]

	return (
		<div className='min-h-screen bg-white text-gray-900'>
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
					<nav className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-600'>
						<a href='#features' className='hover:text-gray-900 transition-colors'>Features</a>
						<Link href='/pricing' className='hover:text-gray-900 transition-colors'>Pricing</Link>
					</nav>
					<div className='flex items-center gap-3'>
						{session ? (
							<Link
								href='/dashboard'
								className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'
							>
								{t('nav.dashboard')} <ArrowRight className='w-4 h-4' />
							</Link>
						) : (
							<>
								<Link href='/login' className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'>
									{t('auth.login.submit')}
								</Link>
								<Link
									href='/register'
									className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'
								>
									{t('landing.ctaPrimary')}
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			{/* HERO */}
			<section
				className='relative pt-32 pb-24 overflow-hidden'
				style={{ background: 'linear-gradient(160deg, #0d0819 0%, #1a0a2e 50%, #0d0819 100%)' }}
			>
				<div
					className='absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full opacity-20 blur-3xl pointer-events-none'
					style={{ background: 'radial-gradient(circle, #FF2D78 0%, transparent 70%)' }}
				/>
				<div className='relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center'>
					{/* Left */}
					<div className='space-y-6 text-center lg:text-left'>
						<span
							className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border'
							style={{ borderColor: 'rgba(255,45,120,0.4)', color: '#FF2D78', background: 'rgba(255,45,120,0.1)' }}
						>
							<Zap className='w-3 h-3' /> {t('landing.builtFor')}
						</span>
						<h1 className='text-5xl sm:text-6xl font-extrabold text-white leading-[1.08] tracking-tight'>
							{t('landing.heroTitle')}{' '}
							<span className='factyo-gradient-text'>{t('landing.heroHighlight')}</span>
							<br />{t('landing.heroSubtitle')}
						</h1>
						<p className='text-gray-400 text-lg max-w-md mx-auto lg:mx-0'>
							{t('landing.heroCopy')}
						</p>
						<div className='flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
							<Link
								href='/register'
								className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity text-base'
							>
								{t('landing.ctaPrimary')} <ArrowRight className='w-4 h-4' />
							</Link>
							<Link
								href='/pricing'
								className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all text-base'
							>
								{t('landing.ctaSecondary')}
							</Link>
						</div>
						<p className='text-gray-500 text-sm'>{t('landing.noCard')}</p>
					</div>

					{/* Right — invoice card mockup */}
					<div className='relative flex justify-center lg:justify-end'>
						<div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-sm'>
							<div className='factyo-gradient px-6 py-4 flex justify-between items-center'>
								<span className='font-extrabold text-white text-lg tracking-tight'>FACTYO</span>
								<div className='text-right text-white/90 text-xs'>
									<div className='font-semibold'>INVOICE #1053</div>
									<div>June 12, 2026</div>
								</div>
							</div>
							<div className='p-6 space-y-4'>
								<div className='flex justify-between'>
									<div>
										<p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>Billed To</p>
										<p className='font-bold text-gray-900'>Jane Doe</p>
										<p className='text-gray-500 text-xs'>Acme Corp</p>
										<p className='text-gray-500 text-xs'>Amsterdam, NL</p>
									</div>
									<div className='text-right'>
										<p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>Due Date</p>
										<p className='font-bold text-gray-900'>Jun 26, 2026</p>
									</div>
								</div>
								<table className='w-full text-xs border-collapse'>
									<thead>
										<tr className='border-b border-gray-100'>
											<th className='text-left py-2 text-gray-400 font-medium'>Description</th>
											<th className='text-right py-2 text-gray-400 font-medium'>Total</th>
										</tr>
									</thead>
									<tbody>
										<tr className='border-b border-gray-50'>
											<td className='py-2 text-gray-700'>Web Design Work</td>
											<td className='py-2 text-right font-semibold'>€750.00</td>
										</tr>
									</tbody>
								</table>
								<div className='pt-2 space-y-1 text-xs'>
									<div className='flex justify-between text-gray-500'>
										<span>Subtotal</span><span>€750.00</span>
									</div>
									<div className='flex justify-between text-gray-500'>
										<span>VAT (0%)</span><span>€0.00</span>
									</div>
									<div className='flex justify-between font-extrabold text-base text-gray-900 pt-1 border-t border-gray-200'>
										<span>Total Due</span>
										<span style={{ color: '#FF2D78' }}>€750.00</span>
									</div>
								</div>
								<button className='w-full py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'>
									Send Invoice
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FEATURES */}
			<section id='features' className='py-24 bg-gray-50'>
				<div className='max-w-6xl mx-auto px-6'>
					<div className='text-center max-w-2xl mx-auto mb-16'>
						<h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight mb-4'>
							{t('landing.featuresTitle')}
						</h2>
						<p className='text-gray-500 text-lg'>{t('landing.featuresCopy')}</p>
					</div>
					<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
						{features.map(({ icon: Icon, title, desc }) => (
							<div key={title} className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
								<div
									className='w-10 h-10 rounded-xl flex items-center justify-center mb-4'
									style={{ background: 'rgba(255,45,120,0.1)' }}
								>
									<Icon className='w-5 h-5' style={{ color: '#FF2D78' }} />
								</div>
								<h3 className='font-bold text-gray-900 mb-2'>{title}</h3>
								<p className='text-gray-500 text-sm leading-relaxed'>{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* PRICING PREVIEW */}
			<section className='py-24 bg-white'>
				<div className='max-w-6xl mx-auto px-6'>
					<div className='text-center max-w-2xl mx-auto mb-16'>
						<h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight mb-4'>
							{t('landing.pricingTitle')}
						</h2>
						<p className='text-gray-500 text-lg'>{t('landing.pricingCopy')}</p>
					</div>
					<div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
						{plans.map(plan => (
							<div
								key={plan.nameKey}
								className={`relative rounded-2xl p-6 border flex flex-col ${
									plan.highlight ? 'border-transparent shadow-xl text-white' : 'border-gray-200 bg-white'
								}`}
								style={plan.highlight ? { background: 'linear-gradient(135deg, #FF2D78 0%, #c1002d 100%)' } : {}}
							>
								{plan.highlight && (
									<span className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1'>
										<Star className='w-3 h-3 fill-current' /> {t('pricing.mostPopular')}
									</span>
								)}
								<div className='mb-4'>
									<h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
										{t(plan.nameKey)}
									</h3>
									<div className='flex items-baseline gap-1'>
										<span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
											{plan.price}
										</span>
										<span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>
											{t(plan.perKey)}
										</span>
									</div>
									<p className={`text-sm mt-2 ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>
										{plan.desc}
									</p>
								</div>
								<ul className='space-y-2 mb-6 flex-1'>
									{plan.features.map(f => (
										<li key={f} className='flex items-center gap-2 text-sm'>
											<Check
												className='w-4 h-4 shrink-0'
												style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#FF2D78' }}
											/>
											<span className={plan.highlight ? 'text-white/90' : 'text-gray-600'}>{f}</span>
										</li>
									))}
								</ul>
								<Link
									href={plan.href}
									className={`w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all ${
										plan.highlight
											? 'bg-white text-gray-900 hover:bg-gray-100'
											: 'border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900'
									}`}
								>
									{plan.highlight ? t('pricing.choosePlan') : t('pricing.getStartedFree')}
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA BANNER */}
			<section
				className='py-20'
				style={{ background: 'linear-gradient(135deg, #0d0819 0%, #1a0a2e 100%)' }}
			>
				<div className='max-w-3xl mx-auto px-6 text-center space-y-6'>
					<h2 className='text-4xl font-extrabold text-white'>{t('landing.ctaBannerTitle')}</h2>
					<p className='text-gray-400 text-lg'>{t('landing.ctaBannerCopy')}</p>
					<Link
						href='/register'
						className='inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white factyo-gradient hover:opacity-90 transition-opacity text-base'
					>
						{t('landing.ctaPrimary')} <ArrowRight className='w-4 h-4' />
					</Link>
				</div>
			</section>

			{/* FOOTER */}
			<footer className='bg-white border-t border-gray-100 pt-12 pb-8'>
				<div className='max-w-6xl mx-auto px-6'>
					{/* Top row: brand + columns */}
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-10'>
						{/* Brand */}
						<div className='col-span-2 md:col-span-1 space-y-3'>
							<Link href='/' className='flex items-center gap-2'>
								<div className='w-7 h-7 rounded-lg factyo-gradient flex items-center justify-center'>
									<FileText className='w-3.5 h-3.5 text-white' />
								</div>
								<span className='font-extrabold text-gray-900 tracking-tight'>
									Fact<span style={{ color: '#FF2D78' }}>yo</span>
								</span>
							</Link>
							<p className='text-xs text-gray-400 leading-relaxed'>
								Professioneel factureren voor Nederlandse ZZP'ers en freelancers.
							</p>
						</div>

						{/* Product */}
						<div className='space-y-3'>
							<p className='text-xs font-bold text-gray-900 uppercase tracking-wider'>Product</p>
							<ul className='space-y-2 text-xs text-gray-500'>
								<li><Link href='/pricing' className='hover:text-gray-800 transition-colors'>Prijzen</Link></li>
								<li><Link href='/register' className='hover:text-gray-800 transition-colors'>Gratis beginnen</Link></li>
								<li><Link href='/login' className='hover:text-gray-800 transition-colors'>Inloggen</Link></li>
							</ul>
						</div>

						{/* Legal */}
						<div className='space-y-3'>
							<p className='text-xs font-bold text-gray-900 uppercase tracking-wider'>{t('footer.legal')}</p>
							<ul className='space-y-2 text-xs text-gray-500'>
								<li><Link href='/privacy' className='hover:text-gray-800 transition-colors'>{t('legal.privacy')}</Link></li>
								<li><Link href='/terms' className='hover:text-gray-800 transition-colors'>{t('legal.terms')}</Link></li>
								<li><Link href='/cookies' className='hover:text-gray-800 transition-colors'>{t('legal.cookies')}</Link></li>
							</ul>
						</div>

						{/* Company info (KvK / BTW) */}
						<div className='space-y-3'>
							<p className='text-xs font-bold text-gray-900 uppercase tracking-wider'>{t('footer.company')}</p>
							<ul className='space-y-1.5 text-xs text-gray-500'>
								<li>
									<span className='font-medium text-gray-700'>Factyo</span>
								</li>
								{/* TODO: fill in after KvK registration */}
								<li>{t('footer.kvk')}: <span className='font-mono'>12345678</span></li>
								<li>{t('footer.btw')}: <span className='font-mono'>NL000000000B01</span></li>
								<li className='leading-snug'>
									Voorbeeldstraat 1<br />
									1234 AB Amsterdam
								</li>
								<li>
									<a
										href='mailto:info@factyo.com'
										className='hover:text-gray-800 transition-colors'
									>
										info@factyo.com
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom bar */}
					<div className='border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400'>
						<p>&copy; {new Date().getFullYear()} Factyo. {t('footer.rights')}</p>
						<p>{t('footer.poweredBy')}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
