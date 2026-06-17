'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getAdminStatsAction } from '@/actions/admin.action'
import { Users, FileText, TrendingUp, CheckCircle, XCircle, CreditCard, Shield } from 'lucide-react'

const fmt = (n: number) =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export default function AdminPage() {
	const { data: session, status } = useSession()
	const [stats, setStats] = useState<any>(null)
	const [recentUsers, setRecentUsers] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const userId: string | undefined =
		(session as any)?.currentUser?._id ?? session?.user?.id

	useEffect(() => {
		if (status === 'loading' || !userId) return
		const load = async () => {
			const res = await getAdminStatsAction({ userId })
			if (res?.data?.stats) {
				setStats(res.data.stats)
				setRecentUsers(res.data.recentUsers ?? [])
			}
			setLoading(false)
		}
		load()
	}, [userId, status])

	const cards = stats
		? [
				{ label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6366f1', bg: '#eef2ff' },
				{ label: 'Verified Users', value: stats.verifiedUsers, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
				{ label: 'Unverified', value: stats.unverifiedUsers, icon: XCircle, color: '#f59e0b', bg: '#fffbeb' },
				{ label: 'Total Invoices', value: stats.totalInvoices, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
				{ label: 'Paid Invoices', value: stats.paidInvoices, icon: TrendingUp, color: '#10b981', bg: '#f0fdf4' },
				{ label: 'Basic Plans', value: stats.basicUsers, icon: CreditCard, color: '#8b5cf6', bg: '#f5f3ff' },
				{ label: 'Unlimited Plans', value: stats.unlimitedUsers, icon: Shield, color: '#FF2D78', bg: 'rgba(255,45,120,0.08)' },
				{ label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: TrendingUp, color: '#10b981', bg: '#f0fdf4', isText: true },
			]
		: []

	return (
		<div className='max-w-5xl mx-auto space-y-8'>
			<div>
				<h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
					<Shield className='w-6 h-6 text-pink-500' /> Admin Overview
				</h1>
				<p className='text-gray-500 text-sm mt-0.5'>Platform statistics and recent activity</p>
			</div>

			{loading ? (
				<div className='flex justify-center py-16'>
					<div className='w-7 h-7 rounded-full border-2 border-pink-400 border-t-transparent animate-spin' />
				</div>
			) : (
				<>
					<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
						{cards.map(({ label, value, icon: Icon, color, bg, isText }) => (
							<div key={label} className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm'>
								<div className='flex items-center justify-between mb-3'>
									<p className='text-xs font-semibold text-gray-500 leading-tight'>{label}</p>
									<div className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0' style={{ background: bg }}>
										<Icon className='w-4 h-4' style={{ color }} />
									</div>
								</div>
								<p className={`font-extrabold text-gray-900 ${isText ? 'text-lg' : 'text-2xl'}`}>{value}</p>
							</div>
						))}
					</div>

					{/* Recent users */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
						<div className='px-6 py-4 border-b border-gray-50'>
							<h2 className='font-bold text-gray-900'>Recent Signups</h2>
						</div>
						{recentUsers.length === 0 ? (
							<p className='px-6 py-8 text-sm text-gray-400'>No users yet.</p>
						) : (
							<div className='divide-y divide-gray-50'>
								{recentUsers.map((u: any) => (
									<div key={u._id} className='flex items-center justify-between px-6 py-3.5'>
										<div className='flex items-center gap-3'>
											<div className='w-8 h-8 rounded-full factyo-gradient flex items-center justify-center text-white text-sm font-bold shrink-0'>
												{u.fullName?.charAt(0)?.toUpperCase() ?? '?'}
											</div>
											<div>
												<p className='text-sm font-semibold text-gray-900'>{u.fullName}</p>
												<p className='text-xs text-gray-400'>{u.email}</p>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'}`}>
												{u.isVerified ? 'Verified' : 'Unverified'}
											</span>
											<span className='text-xs text-gray-400 capitalize'>{u.plan}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
