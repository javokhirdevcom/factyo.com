'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInvoicesAction, deleteInvoiceAction } from '@/actions/invoice.action'
import { IInvoice } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { FileText, Plus, Trash2, Eye, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const statusClass: Record<string, string> = {
	draft: 'bg-gray-100 text-gray-600',
	sent: 'bg-blue-50 text-blue-600',
	paid: 'bg-green-50 text-green-700',
}

const fmt = (n: number) =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export default function InvoicesPage() {
	const { t } = useLanguage()
	const { data: session, status } = useSession()
	const [invoices, setInvoices] = useState<IInvoice[]>([])
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [confirmId, setConfirmId] = useState<string | null>(null)

	const user = (session as any)?.currentUser
	const userId: string | undefined = user?._id ?? session?.user?.id
	const plan = user?.plan ?? 'free'
	const invoiceCount = user?.invoiceCount ?? 0

	const load = async () => {
		if (!userId) { setLoading(false); return }
		setLoading(true)
		const res = await getInvoicesAction({ userId })
		if (res?.data?.invoices) setInvoices(res.data.invoices)
		setLoading(false)
	}

	useEffect(() => {
		if (status === 'loading') return
		load()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, status])

	const handleDelete = async (id: string) => {
		if (!userId) return
		setDeleting(id)
		const res = await deleteInvoiceAction({ userId, invoiceId: id })
		if (res?.data?.success) {
			toast.success(t('invoices.deleted'))
			setInvoices(prev => prev.filter(i => i._id !== id))
		} else {
			toast.error(t('common.error'))
		}
		setDeleting(null)
		setConfirmId(null)
	}

	const atLimit =
		(plan === 'free' && invoiceCount >= 1) ||
		(plan === 'basic' && invoiceCount >= 10)

	const statusKey = (s: string) => {
		const map: Record<string, string> = { draft: 'invoices.statusDraft', sent: 'invoices.statusSent', paid: 'invoices.statusPaid' }
		return t(map[s] ?? s)
	}

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{/* Delete confirm modal */}
			{confirmId && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4'>
						<h3 className='font-bold text-gray-900'>{t('invoices.deleteInvoice')}</h3>
						<p className='text-sm text-gray-500'>{t('invoices.confirmDelete')}</p>
						<div className='flex gap-3'>
							<button
								onClick={() => setConfirmId(null)}
								className='flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50'
							>
								{t('common.cancel')}
							</button>
							<button
								onClick={() => handleDelete(confirmId)}
								disabled={!!deleting}
								className='flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60'
							>
								{deleting ? t('common.loading') : t('common.delete')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900'>{t('invoices.title')}</h1>
					<p className='text-gray-500 text-sm mt-0.5'>
						{invoices.length} {t('invoices.invoicesLabel')}
						{plan !== 'unlimited' && ` · ${invoiceCount} ${t('invoices.usedOf')} ${plan === 'free' ? 1 : 10}`}
					</p>
				</div>
				{atLimit ? (
					<Link
						href='/pricing'
						className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
					>
						<AlertCircle className='w-4 h-4' /> {t('invoices.upgradePlan')}
					</Link>
				) : (
					<Link
						href='/dashboard/invoices/create'
						className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
					>
						<Plus className='w-4 h-4' /> {t('nav.newInvoice')}
					</Link>
				)}
			</div>

			{/* Upgrade nudge */}
			{atLimit && (
				<div className='rounded-2xl p-4 flex items-center gap-3' style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)' }}>
					<AlertCircle className='w-5 h-5 shrink-0' style={{ color: '#FF2D78' }} />
					<p className='text-sm text-gray-800'>
						{plan === 'free' ? t('invoices.limitReachedFree') : t('invoices.limitReachedBasic')}{' '}
						<Link href='/pricing' className='font-bold underline' style={{ color: '#FF2D78' }}>{t('invoices.upgradePlan')}</Link>
					</p>
				</div>
			)}

			{/* Table */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
				{loading ? (
					<div className='p-10 text-center'>
						<div className='w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin mx-auto' />
					</div>
				) : invoices.length === 0 ? (
					<div className='p-16 flex flex-col items-center gap-3 text-center'>
						<div className='w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center'>
							<FileText className='w-7 h-7 text-gray-400' />
						</div>
						<p className='font-bold text-gray-800 text-lg'>{t('dashboard.noInvoices')}</p>
						<p className='text-sm text-gray-400 max-w-xs'>{t('dashboard.noInvoicesDesc')}</p>
						{!atLimit && (
							<Link
								href='/dashboard/invoices/create'
								className='mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
							>
								<Plus className='w-4 h-4 inline mr-1' />{t('invoices.createInvoice')}
							</Link>
						)}
					</div>
				) : (
					<>
						<div className='hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
							<span>{t('invoices.invoiceNumber')}</span>
							<span>{t('invoices.client')}</span>
							<span>{t('invoices.date')}</span>
							<span>{t('invoices.total')}</span>
							<span />
						</div>
						<div className='divide-y divide-gray-50'>
							{invoices.map(inv => {
								const client = typeof inv.clientId === 'object' ? inv.clientId : null
								return (
									<div key={inv._id} className='grid md:grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors'>
										<div className='flex items-center gap-3 min-w-0'>
											<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center shrink-0'>
												<FileText className='w-4 h-4 text-white' />
											</div>
											<div className='min-w-0'>
												<p className='font-semibold text-gray-900 text-sm'>{inv.invoiceNumber}</p>
												<span className={`md:hidden text-xs font-semibold px-1.5 py-0.5 rounded-full ${statusClass[inv.status]}`}>
													{statusKey(inv.status)}
												</span>
											</div>
										</div>
										<div className='hidden md:block min-w-0'>
											<p className='text-sm text-gray-700 font-medium truncate'>{client?.name ?? '—'}</p>
											<p className='text-xs text-gray-400 truncate'>{client?.company}</p>
										</div>
										<div className='hidden md:block'>
											<p className='text-sm text-gray-600'>
												{new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
											</p>
											<span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${statusClass[inv.status]}`}>
												{statusKey(inv.status)}
											</span>
										</div>
										<p className='font-bold text-gray-900 text-sm md:text-base'>{fmt(inv.total)}</p>
										<div className='flex items-center gap-1'>
											<Link
												href={`/dashboard/invoices/${inv._id}`}
												className='p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800'
											>
												<Eye className='w-4 h-4' />
											</Link>
											<button
												onClick={() => setConfirmId(inv._id)}
												disabled={deleting === inv._id}
												className='p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</div>
								)
							})}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
