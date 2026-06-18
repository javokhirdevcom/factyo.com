'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
	getAdminUsersAction, verifyUserAction, unverifyUserAction,
	updateUserRoleAction, updateUserPlanAction, banUserAction, unbanUserAction,
	cancelUserSubscriptionAction, deleteUserAction, getUserDetailAction,
} from '@/actions/admin.action'
import { toast } from 'sonner'
import {
	Search, CheckCircle, XCircle, Shield, Trash2, RefreshCw,
	Users, Ban, CreditCard, Eye, X, FileText, ChevronDown,
} from 'lucide-react'

const planColor: Record<string, string> = { free: '#9ca3af', basic: '#3b82f6', unlimited: '#FF2D78' }
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtEur = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export default function AdminUsersPage() {
	const { data: session, status } = useSession()
	const [users, setUsers] = useState<any[]>([])
	const [total, setTotal] = useState(0)
	const [search, setSearch] = useState('')
	const [planFilter, setPlanFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [confirmDelete, setConfirmDelete] = useState<any | null>(null)
	const [detailUser, setDetailUser] = useState<any | null>(null)
	const [detailInvoices, setDetailInvoices] = useState<any[]>([])
	const [detailLoading, setDetailLoading] = useState(false)
	const [planModal, setPlanModal] = useState<any | null>(null)
	const [newPlan, setNewPlan] = useState<'free' | 'basic' | 'unlimited'>('free')

	const adminId: string = (session as any)?.currentUser?._id ?? session?.user?.id ?? ''

	const load = async (q = search) => {
		if (!adminId) { setLoading(false); return }
		setLoading(true)
		const res = await getAdminUsersAction({ userId: adminId, search: q, plan: planFilter, status: statusFilter })
		if (res?.serverError) toast.error('Server error: ' + res.serverError)
		else if (res?.data?.failure) toast.error('Access denied: ' + res.data.failure)
		else if (res?.data?.users) { setUsers(res.data.users); setTotal(res.data.total ?? res.data.users.length) }
		else toast.error('Unexpected response.')
		setLoading(false)
	}

	useEffect(() => {
		if (status === 'loading' || !adminId) return
		load()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminId, status, planFilter, statusFilter])

	const openDetail = async (u: any) => {
		setDetailUser(u); setDetailInvoices([]); setDetailLoading(true)
		const res = await getUserDetailAction({ adminId, targetUserId: u._id })
		if (res?.data?.invoices) setDetailInvoices(res.data.invoices)
		setDetailLoading(false)
	}

	const handleVerify = async (userId: string, verify: boolean) => {
		setActionLoading(userId)
		const res = await (verify ? verifyUserAction : unverifyUserAction)({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(p => p.map(u => u._id === userId ? { ...u, isVerified: verify } : u))
			if (detailUser?._id === userId) setDetailUser((d: any) => ({ ...d, isVerified: verify }))
			toast.success(verify ? 'Verified.' : 'Unverified.')
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null)
	}

	const handleRole = async (userId: string, currentRole: string) => {
		const newRole = currentRole === 'admin' ? 'user' : 'admin'
		setActionLoading(userId + '-role')
		const res = await updateUserRoleAction({ adminId, targetUserId: userId, role: newRole as 'user' | 'admin' })
		if (res?.data?.success) {
			setUsers(p => p.map(u => u._id === userId ? { ...u, role: newRole } : u))
			if (detailUser?._id === userId) setDetailUser((d: any) => ({ ...d, role: newRole }))
			toast.success('Role changed to ' + newRole)
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null)
	}

	const handleBan = async (userId: string, ban: boolean) => {
		setActionLoading(userId + '-ban')
		const res = await (ban ? banUserAction : unbanUserAction)({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(p => p.map(u => u._id === userId ? { ...u, isBanned: ban } : u))
			if (detailUser?._id === userId) setDetailUser((d: any) => ({ ...d, isBanned: ban }))
			toast.success(ban ? 'User banned.' : 'User unbanned.')
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null)
	}

	const handlePlanChange = async () => {
		if (!planModal) return
		setActionLoading(planModal._id + '-plan')
		const res = await updateUserPlanAction({ adminId, targetUserId: planModal._id, plan: newPlan })
		if (res?.data?.success) {
			setUsers(p => p.map(u => u._id === planModal._id ? { ...u, plan: newPlan } : u))
			if (detailUser?._id === planModal._id) setDetailUser((d: any) => ({ ...d, plan: newPlan }))
			toast.success('Plan changed to ' + newPlan); setPlanModal(null)
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null)
	}

	const handleCancelSub = async (userId: string) => {
		setActionLoading(userId + '-cancel')
		const res = await cancelUserSubscriptionAction({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(p => p.map(u => u._id === userId ? { ...u, subscriptionStatus: 'cancelling' } : u))
			toast.success('Subscription will cancel at period end.')
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null)
	}

	const handleDelete = async (userId: string) => {
		setActionLoading(userId + '-del')
		const res = await deleteUserAction({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(p => p.filter(u => u._id !== userId))
			setTotal(t => t - 1)
			if (detailUser?._id === userId) setDetailUser(null)
			toast.success('User deleted.')
		} else toast.error(res?.data?.failure || 'Failed.')
		setActionLoading(null); setConfirmDelete(null)
	}

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
						<Users className="w-6 h-6 text-pink-500" /> Users
					</h1>
					<p className="text-gray-500 text-sm mt-0.5">{total} total users</p>
				</div>
				<button onClick={() => load()} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
					<RefreshCw className="w-4 h-4 text-gray-500" />
				</button>
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="relative flex-1 min-w-52">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input type="text" placeholder="Search by name or email..." value={search}
						onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)}
						className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white" />
				</div>
				<div className="relative">
					<select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
						className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
						<option value="">All plans</option>
						<option value="free">Free</option>
						<option value="basic">Basic</option>
						<option value="unlimited">Unlimited</option>
					</select>
					<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
				</div>
				<div className="relative">
					<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
						className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
						<option value="">All statuses</option>
						<option value="verified">Verified</option>
						<option value="unverified">Unverified</option>
						<option value="banned">Banned</option>
					</select>
					<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
				</div>
			</div>

			{confirmDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
						<h3 className="font-bold text-gray-900">Delete {confirmDelete.fullName}?</h3>
						<p className="text-sm text-gray-500">This soft-deletes the user. They lose access immediately.</p>
						<div className="flex gap-3">
							<button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
							<button onClick={() => handleDelete(confirmDelete._id)} disabled={!!actionLoading}
								className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60">
								{actionLoading ? '...' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}

			{planModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 shadow-xl space-y-4">
						<h3 className="font-bold text-gray-900">Change plan for {planModal.fullName}</h3>
						<div className="grid grid-cols-3 gap-2">
							{(['free', 'basic', 'unlimited'] as const).map(p => (
								<button key={p} onClick={() => setNewPlan(p)}
									className={"py-2 rounded-xl text-xs font-bold capitalize transition-colors border " + (newPlan === p ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-600')}>
									{p}
								</button>
							))}
						</div>
						<div className="flex gap-3">
							<button onClick={() => setPlanModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
							<button onClick={handlePlanChange} disabled={!!actionLoading}
								className="flex-1 py-2 rounded-xl text-sm font-bold text-white factyo-gradient disabled:opacity-60">
								{actionLoading ? '...' : 'Apply'}
							</button>
						</div>
					</div>
				</div>
			)}

			{detailUser && (
				<div className="fixed inset-0 z-50 flex justify-end">
					<div className="absolute inset-0 bg-black/40" onClick={() => setDetailUser(null)} />
					<div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
						<div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
							<h2 className="font-bold text-gray-900">User Detail</h2>
							<button onClick={() => setDetailUser(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
						</div>
						<div className="p-6 space-y-6 flex-1">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 rounded-full factyo-gradient flex items-center justify-center text-white text-xl font-bold shrink-0">
									{detailUser.fullName?.charAt(0)?.toUpperCase() ?? '?'}
								</div>
								<div>
									<p className="font-bold text-gray-900 text-lg">{detailUser.fullName}</p>
									<p className="text-sm text-gray-400">{detailUser.email}</p>
									<div className="flex flex-wrap gap-1.5 mt-1">
										<span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
											style={{ color: planColor[detailUser.plan], background: planColor[detailUser.plan] + '18', border: '1px solid ' + planColor[detailUser.plan] }}>
											{detailUser.plan}
										</span>
										{detailUser.role === 'admin' && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">Admin</span>}
										{detailUser.isBanned && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Banned</span>}
										{!detailUser.isVerified && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Unverified</span>}
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-gray-50 rounded-xl p-3">
									<p className="text-xs text-gray-400">Joined</p>
									<p className="text-sm font-semibold text-gray-900 mt-0.5">{fmtDate(detailUser.createdAt)}</p>
								</div>
								{detailUser.subscriptionStatus && (
									<div className="bg-gray-50 rounded-xl p-3">
										<p className="text-xs text-gray-400">Subscription</p>
										<p className="text-sm font-semibold capitalize mt-0.5">{detailUser.subscriptionStatus.replace('_', ' ')}</p>
										{detailUser.subscriptionCurrentPeriodEnd && (
											<p className="text-xs text-gray-400">ends {fmtDate(detailUser.subscriptionCurrentPeriodEnd)}</p>
										)}
									</div>
								)}
								{detailUser.businessName && (
									<div className="bg-gray-50 rounded-xl p-3 col-span-2">
										<p className="text-xs text-gray-400">Business</p>
										<p className="text-sm font-semibold text-gray-900 mt-0.5">{detailUser.businessName}</p>
									</div>
								)}
							</div>
							<div className="space-y-2">
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</p>
								<div className="grid grid-cols-2 gap-2">
									<button onClick={() => handleVerify(detailUser._id, !detailUser.isVerified)} disabled={actionLoading === detailUser._id}
										className={"py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 " + (detailUser.isVerified ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100')}>
										{detailUser.isVerified ? 'Unverify' : 'Verify Email'}
									</button>
									<button onClick={() => { setPlanModal(detailUser); setNewPlan(detailUser.plan) }}
										className="py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
										Change Plan
									</button>
									<button onClick={() => handleRole(detailUser._id, detailUser.role)} disabled={actionLoading === detailUser._id + '-role'}
										className="py-2 rounded-xl text-xs font-bold bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors disabled:opacity-50">
										{detailUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
									</button>
									<button onClick={() => handleBan(detailUser._id, !detailUser.isBanned)} disabled={actionLoading === detailUser._id + '-ban'}
										className={"py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 " + (detailUser.isBanned ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-50 text-red-500 hover:bg-red-100')}>
										{detailUser.isBanned ? 'Unban User' : 'Ban User'}
									</button>
									{detailUser.subscriptionId && detailUser.subscriptionStatus === 'active' && (
										<button onClick={() => handleCancelSub(detailUser._id)} disabled={actionLoading === detailUser._id + '-cancel'}
											className="col-span-2 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50">
											Cancel Subscription at Period End
										</button>
									)}
									<button onClick={() => setConfirmDelete(detailUser)}
										className="col-span-2 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
										Delete User
									</button>
								</div>
							</div>
							<div>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Invoices</p>
								{detailLoading ? (
									<div className="flex justify-center py-6"><div className="w-5 h-5 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" /></div>
								) : detailInvoices.length === 0 ? (
									<p className="text-sm text-gray-400">No invoices yet.</p>
								) : (
									<div className="space-y-2">
										{detailInvoices.map((inv: any) => (
											<div key={inv._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
												<div className="flex items-center gap-2">
													<FileText className="w-4 h-4 text-gray-400" />
													<div>
														<p className="text-xs font-semibold text-gray-900">{inv.invoiceNumber}</p>
														<p className="text-xs text-gray-400">{fmtDate(inv.createdAt)}</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-xs font-bold text-gray-900">{fmtEur(inv.total ?? 0)}</p>
													<span className={"text-xs font-semibold capitalize " + (inv.status === 'paid' ? 'text-green-600' : inv.status === 'overdue' ? 'text-red-500' : 'text-amber-500')}>
														{inv.status}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" /></div>
				) : users.length === 0 ? (
					<p className="p-12 text-center text-sm text-gray-400">No users found.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
									<th className="px-5 py-3 text-left">User</th>
									<th className="px-5 py-3 text-left">Plan</th>
									<th className="px-5 py-3 text-left">Sub</th>
									<th className="px-5 py-3 text-left">Verified</th>
									<th className="px-5 py-3 text-left">Role</th>
									<th className="px-5 py-3 text-left">Joined</th>
									<th className="px-5 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{users.map((u: any) => (
									<tr key={u._id} className={"hover:bg-gray-50/50 transition-colors " + (u.isBanned ? 'opacity-60' : '')}>
										<td className="px-5 py-3.5">
											<div className="flex items-center gap-2.5">
												<div className="w-8 h-8 rounded-full factyo-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
													{u.fullName?.charAt(0)?.toUpperCase() ?? '?'}
												</div>
												<div>
													<div className="flex items-center gap-1.5">
														<p className="font-semibold text-gray-900">{u.fullName}</p>
														{u.isBanned && <Ban className="w-3 h-3 text-red-400" />}
													</div>
													<p className="text-xs text-gray-400">{u.email}</p>
												</div>
											</div>
										</td>
										<td className="px-5 py-3.5">
											<span className="text-xs font-semibold px-2 py-0.5 rounded-full border capitalize"
												style={{ color: planColor[u.plan] || '#9ca3af', borderColor: planColor[u.plan] || '#9ca3af', background: (planColor[u.plan] || '#9ca3af') + '18' }}>
												{u.plan}
											</span>
										</td>
										<td className="px-5 py-3.5">
											{u.subscriptionStatus
												? <span className={"text-xs font-semibold capitalize " + (u.subscriptionStatus === 'active' ? 'text-green-600' : u.subscriptionStatus === 'past_due' ? 'text-red-500' : 'text-amber-500')}>
													{u.subscriptionStatus.replace('_', ' ')}
												</span>
												: <span className="text-xs text-gray-300">-</span>}
										</td>
										<td className="px-5 py-3.5">
											<span className={"flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full " + (u.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600')}>
												{u.isVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
												{u.isVerified ? 'Yes' : 'No'}
											</span>
										</td>
										<td className="px-5 py-3.5">
											<span className={"text-xs font-bold px-2 py-0.5 rounded-full capitalize " + (u.role === 'admin' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500')}>
												{u.role}
											</span>
										</td>
										<td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(u.createdAt)}</td>
										<td className="px-5 py-3.5">
											<div className="flex items-center justify-end gap-1">
												<button onClick={() => openDetail(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
												<button onClick={() => handleVerify(u._id, !u.isVerified)} disabled={actionLoading === u._id}
													className={"p-1.5 rounded-lg transition-colors disabled:opacity-50 " + (u.isVerified ? 'hover:bg-amber-50 text-amber-400' : 'hover:bg-green-50 text-green-500')}>
													{u.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
												</button>
												<button onClick={() => { setPlanModal(u); setNewPlan(u.plan) }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"><CreditCard className="w-4 h-4" /></button>
												<button onClick={() => handleRole(u._id, u.role)} disabled={actionLoading === u._id + '-role'}
													className="p-1.5 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"><Shield className="w-4 h-4" /></button>
												<button onClick={() => handleBan(u._id, !u.isBanned)} disabled={actionLoading === u._id + '-ban'}
													className={"p-1.5 rounded-lg transition-colors disabled:opacity-50 " + (u.isBanned ? 'hover:bg-gray-100 text-amber-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500')}>
													<Ban className="w-4 h-4" />
												</button>
												<button onClick={() => setConfirmDelete(u)} disabled={!!actionLoading}
													className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
