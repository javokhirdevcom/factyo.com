'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInvoicesAction } from '@/actions/invoice.action'
import { IInvoice } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { FileText, Plus, TrendingUp, Clock, CheckCircle, AlertCircle, Euro, Receipt } from 'lucide-react'

const PLAN_LIMITS: Record<string, number | string> = { free: 3, basic: 10, unlimited: '∞' }

const statusClass: Record<string, string> = {
	draft: 'bg-gray-100 text-gray-600',
	sent: 'bg-blue-50 text-blue-600',
	paid: 'bg-green-50 text-green-600',
}

const fmt = (n: number) =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export default function DashboardPage() {
	const { t } = useLanguage()
	const { data: session } = useSession()
	const [invoices, setInvoices] = useState<IInvoice[]>([])
	const [loading, setLoading] = useState(true)

	const user = (session as any)?.currentUser
	const plan = user?.plan ?? 'free'
	const invoiceCount = user?.invoiceCount ?? 0

	useEffect(() => {
		const load = async () => {
			const userId = user?._id
			if (!userId) return
			const res = await getInvoicesAction({ userId })
			if (res?.data?.invoices) setInvoices(res.data.invoices)
			setLoading(false)
		}
		if (user) load()
	}, [user])

	const paidInvoices = invoices.filter(i => i.status === 'paid')
	const sentInvoices = invoices.filter(i => i.status === 'sent')
	const draftInvoices = invoices.filter(i => i.status === 'draft')

	const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0)
	const outstanding = sentInvoices.reduce((s, i) => s + i.total, 0)
	const btwCollected = paidInvoices.reduce((s, i) => s + i.vatAmount, 0)
	const btwOutstanding = sentInvoices.reduce((s, i) => s + i.vatAmount, 0)
	const exclBtw = paidInvoices.reduce((s, i) => s + i.subtotal, 0)

	const recent = invoices.slice(0, 5)

	const statusKey = (s: string) => {
		const map: Record<string, string> = { draft: 'invoices.statusDraft', sent: 'invoices.statusSent', paid: 'invoices.statusPaid' }
		return t(map[s] ?? s)
	}

	const today = new Date()
	const overdueInvoices = sentInvoices.filter(i => new Date(i.dueDate) < today)
	const overdueAmount = overdueInvoices.reduce((s, i) => s + i.total, 0)

	const statCards = [
		{
			label: t('dashboard.revenueLabel'),
			value: loading ? '—' : fmt(totalRevenue),
			sub: loading ? '' : `${paidInvoices.length} ${t('dashboard.invoicesCount')}`,
			icon: TrendingUp,
			color: '#10b981',
			bg: '#f0fdf4',
		},
		{
			label: t('dashboard.outstandingLabel'),
			value: loading ? '—' : fmt(outstanding),
			sub: loading ? '' : `${sentInvoices.length} ${t('dashboard.sentLabel')}`,
			icon: Clock,
			color: '#f59e0b',
			bg: '#fffbeb',
		},
		{
			label: t('dashboard.vatToPayLabel'),
			value: loading ? '—' : fmt(btwCollected),
			sub: loading ? '' : `+ ${fmt(btwOutstanding)} ${t('dashboard.vatPending')}`,
			icon: Receipt,
			color: '#8b5cf6',
			bg: '#f5f3ff',
		},
		{
			label: t('dashboard.revenueExclVatLabel'),
			value: loading ? '—' : fmt(exclBtw),
			sub: loading ? '' : `${paidInvoices.length} ${t('dashboard.paidInvoicesLabel')}`,
			icon: Euro,
			color: '#FF2D78',
			bg: 'rgba(255,45,120,0.06)',
		},
	]

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900'>
						{t('dashboard.welcome')} {user?.fullName?.split(' ')[0] ?? 'there'} 👋
					</h1>
					<p className='text-gray-500 text-sm mt-0.5'>{t('dashboard.overview')}</p>
				</div>
				<Link
					href='/dashboard/invoices/create'
					className='hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
				>
					<Plus className='w-4 h-4' /> {t('nav.newInvoice')}
				</Link>
			</div>

			{/* Plan banner */}
			{plan === 'free' && (
				<div className='rounded-2xl p-4 flex items-center justify-between gap-4' style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)' }}>
					<div className='flex items-center gap-3'>
						<AlertCircle className='w-5 h-5 shrink-0' style={{ color: '#FF2D78' }} />
						<p className='text-sm font-medium text-gray-800'>
							{t('dashboard.planBannerPre')} <span className='font-bold'>{invoiceCount}/{PLAN_LIMITS[plan]}</span> {t('dashboard.planBannerUsed')}{' '}
							{t('dashboard.planBannerCta')}
						</p>
					</div>
					<Link href='/pricing' className='shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'>
						{t('dashboard.upgradeNow')}
					</Link>
				</div>
			)}

			{/* Overdue alert */}
			{!loading && overdueInvoices.length > 0 && (
				<div className='rounded-2xl p-4 flex items-center justify-between gap-4 bg-red-50 border border-red-100'>
					<div className='flex items-center gap-3'>
						<AlertCircle className='w-5 h-5 shrink-0 text-red-500' />
						<p className='text-sm font-medium text-red-800'>
							<span className='font-bold'>{overdueInvoices.length}</span> {t('dashboard.overdueLabel')} — {fmt(overdueAmount)}
						</p>
					</div>
					<Link href='/dashboard/invoices' className='shrink-0 text-xs font-semibold text-red-600 underline'>
						{t('dashboard.viewAll')}
					</Link>
				</div>
			)}

			{/* Revenue stats */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
				{statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
					<div key={label} className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm'>
						<div className='flex items-center justify-between mb-3'>
							<p className='text-xs font-semibold text-gray-500 leading-tight'>{label}</p>
							<div className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0' style={{ background: bg }}>
								<Icon className='w-4 h-4' style={{ color }} />
							</div>
						</div>
						<p className='text-xl font-extrabold text-gray-900'>{value}</p>
						{sub && <p className='text-xs text-gray-400 mt-0.5'>{sub}</p>}
					</div>
				))}
			</div>

			{/* Invoice counts row */}
			<div className='grid grid-cols-3 gap-4'>
				{[
					{ label: t('dashboard.draft'), count: loading ? '—' : draftInvoices.length, icon: FileText, color: '#8b5cf6' },
					{ label: t('nav.invoices'), count: loading ? '—' : sentInvoices.length, icon: CheckCircle, color: '#3b82f6' },
					{ label: t('dashboard.paid'), count: loading ? '—' : paidInvoices.length, icon: TrendingUp, color: '#10b981' },
				].map(({ label, count, icon: Icon, color }) => (
					<div key={label} className='bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex items-center gap-3'>
						<div className='w-9 h-9 rounded-xl flex items-center justify-center' style={{ background: `${color}15` }}>
							<Icon className='w-4 h-4' style={{ color }} />
						</div>
						<div>
							<p className='text-xl font-extrabold text-gray-900'>{count}</p>
							<p className='text-xs text-gray-400'>{label}</p>
						</div>
					</div>
				))}
			</div>

			{/* Recent invoices */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
				<div className='flex items-center justify-between px-6 py-4 border-b border-gray-50'>
					<h2 className='font-bold text-gray-900'>{t('dashboard.recentInvoices')}</h2>
					<Link href='/dashboard/invoices' className='text-sm font-semibold hover:underline' style={{ color: '#FF2D78' }}>
						{t('dashboard.viewAll')}
					</Link>
				</div>
				{loading ? (
					<div className='p-8 text-center'>
						<div className='w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin mx-auto' />
					</div>
				) : recent.length === 0 ? (
					<div className='p-12 flex flex-col items-center gap-3 text-center'>
						<div className='w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center'>
							<FileText className='w-6 h-6 text-gray-400' />
						</div>
						<p className='font-semibold text-gray-700'>{t('dashboard.noInvoices')}</p>
						<p className='text-sm text-gray-400'>{t('dashboard.noInvoicesDesc')}</p>
						<Link href='/dashboard/invoices/create' className='mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'>
							<Plus className='w-4 h-4 inline mr-1' />{t('dashboard.create')}
						</Link>
					</div>
				) : (
					<div className='divide-y divide-gray-50'>
						{recent.map(inv => {
							const client = typeof inv.clientId === 'object' ? inv.clientId : null
							const isOverdue = inv.status === 'sent' && new Date(inv.dueDate) < today
							return (
								<Link
									key={inv._id}
									href={`/dashboard/invoices/${inv._id}`}
									className='flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors'
								>
									<div className='flex items-center gap-3 min-w-0'>
										<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center shrink-0'>
											<FileText className='w-4 h-4 text-white' />
										</div>
										<div className='min-w-0'>
											<p className='font-semibold text-gray-900 text-sm truncate'>{inv.invoiceNumber}</p>
											<p className='text-xs text-gray-400 truncate'>{client?.name ?? '—'}</p>
										</div>
									</div>
									<div className='flex items-center gap-3 shrink-0'>
										{isOverdue ? (
											<span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600'>{t('dashboard.overdueLabel')}</span>
										) : (
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass[inv.status]}`}>
												{statusKey(inv.status)}
											</span>
										)}
										<span className='text-sm font-bold text-gray-900'>{fmt(inv.total)}</span>
									</div>
								</Link>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
