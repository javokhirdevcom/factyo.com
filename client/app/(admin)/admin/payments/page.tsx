'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getAdminPaymentsAction } from '@/actions/admin.action'
import { toast } from 'sonner'
import { CreditCard, TrendingUp, Clock, RefreshCw, ChevronRight } from 'lucide-react'

interface Payment {
	id: string
	amount: number
	currency: string
	date: number
	customerEmail: string | null
	customerName: string | null
	description: string
	status: string
}

interface Balance {
	available: number
	pending: number
	currency: string
}

function formatAmount(cents: number, currency: string) {
	return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

function formatDate(ts: number) {
	return new Date(ts).toLocaleString('nl-NL', {
		day: '2-digit', month: 'short', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	})
}

export default function AdminPaymentsPage() {
	const { data: session, status } = useSession()
	const [payments, setPayments] = useState<Payment[]>([])
	const [balance, setBalance] = useState<Balance | null>(null)
	const [loading, setLoading] = useState(true)
	const [hasMore, setHasMore] = useState(false)
	const [lastId, setLastId] = useState<string | null>(null)
	const [loadingMore, setLoadingMore] = useState(false)

	const adminId: string = (session as any)?.currentUser?._id ?? session?.user?.id ?? ''

	const load = async (after?: string) => {
		if (!adminId) return
		after ? setLoadingMore(true) : setLoading(true)
		const res = await getAdminPaymentsAction({ userId: adminId, limit: 50, starting_after: after })
		if (res?.data?.success) {
			const p = res.data.payments as Payment[]
			setPayments(prev => after ? [...prev, ...p] : p)
			setBalance(res.data.balance as Balance)
			setHasMore(res.data.hasMore as boolean)
			setLastId(res.data.lastId as string | null)
		} else {
			toast.error(res?.data?.failure || 'Failed to load payments.')
		}
		after ? setLoadingMore(false) : setLoading(false)
	}

	useEffect(() => {
		if (status === 'loading' || !adminId) return
		load()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminId, status])

	const totalCollected = payments.reduce((s, p) => s + p.amount, 0)
	const currency = balance?.currency ?? payments[0]?.currency ?? 'eur'

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
						<CreditCard className='w-6 h-6 text-pink-500' /> Payments
					</h1>
					<p className='text-gray-500 text-sm mt-0.5'>Live data from Stripe</p>
				</div>
				<button
					onClick={() => load()}
					disabled={loading}
					className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50'
				>
					<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
					Refresh
				</button>
			</div>

			{/* Balance cards */}
			<div className='grid sm:grid-cols-3 gap-4'>
				<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center'>
							<TrendingUp className='w-4 h-4 text-green-500' />
						</div>
						<span className='text-sm font-semibold text-gray-500'>Available balance</span>
					</div>
					<p className='text-2xl font-extrabold text-gray-900'>
						{balance ? formatAmount(balance.available, balance.currency) : '—'}
					</p>
					<p className='text-xs text-gray-400 mt-1'>Ready to pay out</p>
				</div>

				<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center'>
							<Clock className='w-4 h-4 text-amber-500' />
						</div>
						<span className='text-sm font-semibold text-gray-500'>Pending</span>
					</div>
					<p className='text-2xl font-extrabold text-gray-900'>
						{balance ? formatAmount(balance.pending, balance.currency) : '—'}
					</p>
					<p className='text-xs text-gray-400 mt-1'>In transit</p>
				</div>

				<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='w-9 h-9 rounded-xl factyo-gradient flex items-center justify-center'>
							<CreditCard className='w-4 h-4 text-white' />
						</div>
						<span className='text-sm font-semibold text-gray-500'>Collected (this view)</span>
					</div>
					<p className='text-2xl font-extrabold text-gray-900'>
						{formatAmount(totalCollected, currency)}
					</p>
					<p className='text-xs text-gray-400 mt-1'>{payments.length} paid invoices shown</p>
				</div>
			</div>

			{/* Payments table */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
				<div className='px-6 py-4 border-b border-gray-50'>
					<h2 className='font-bold text-gray-900'>Payment history</h2>
				</div>

				{loading ? (
					<div className='p-12 flex justify-center'>
						<div className='w-7 h-7 rounded-full border-2 border-pink-400 border-t-transparent animate-spin' />
					</div>
				) : payments.length === 0 ? (
					<div className='p-12 text-center'>
						<CreditCard className='w-10 h-10 text-gray-300 mx-auto mb-3' />
						<p className='font-semibold text-gray-500'>No payments found</p>
						<p className='text-sm text-gray-400 mt-1'>Paid Stripe invoices will appear here.</p>
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b border-gray-50'>
										<th className='text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide'>Date</th>
										<th className='text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide'>Customer</th>
										<th className='text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide'>Description</th>
										<th className='text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide'>Amount</th>
										<th className='text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide'>Status</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-50'>
									{payments.map(p => (
										<tr key={p.id} className='hover:bg-gray-50 transition-colors'>
											<td className='px-6 py-3.5 text-gray-500 whitespace-nowrap'>
												{formatDate(p.date)}
											</td>
											<td className='px-6 py-3.5'>
												<p className='font-medium text-gray-900 truncate max-w-[180px]'>{p.customerName || '—'}</p>
												<p className='text-gray-400 text-xs truncate max-w-[180px]'>{p.customerEmail || '—'}</p>
											</td>
											<td className='px-6 py-3.5 text-gray-500 max-w-[200px] truncate'>
												{p.description || '—'}
											</td>
											<td className='px-6 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap'>
												{formatAmount(p.amount, p.currency)}
											</td>
											<td className='px-6 py-3.5 text-center'>
												<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700'>
													{p.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{hasMore && (
							<div className='px-6 py-4 border-t border-gray-50'>
								<button
									onClick={() => load(lastId ?? undefined)}
									disabled={loadingMore}
									className='flex items-center gap-2 text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors disabled:opacity-50'
								>
									{loadingMore ? (
										<div className='w-4 h-4 rounded-full border-2 border-pink-400 border-t-transparent animate-spin' />
									) : (
										<ChevronRight className='w-4 h-4' />
									)}
									Load more
								</button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Stripe webhook notice */}
			<div className='rounded-2xl p-5 bg-amber-50 border border-amber-100'>
				<p className='text-sm text-amber-800 font-semibold mb-1'>Webhook required for plan updates</p>
				<p className='text-xs text-amber-700'>
					After a user pays, their plan only updates if Stripe can deliver the <code className='bg-amber-100 px-1 rounded'>checkout.session.completed</code> webhook.
					Make sure <code className='bg-amber-100 px-1 rounded'>STRIPE_WEBHOOK_SECRET</code> is set in Railway, then resend failed events from
					Stripe Dashboard → Webhooks → Event Deliveries.
				</p>
			</div>
		</div>
	)
}
