'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
	getAdminUsersAction,
	verifyUserAction,
	unverifyUserAction,
	updateUserRoleAction,
	deleteUserAction,
} from '@/actions/admin.action'
import { toast } from 'sonner'
import { Search, CheckCircle, XCircle, Shield, Trash2, RefreshCw, Users } from 'lucide-react'

const planColor: Record<string, string> = {
	free: '#9ca3af',
	basic: '#3b82f6',
	unlimited: '#FF2D78',
}

export default function AdminUsersPage() {
	const { data: session, status } = useSession()
	const [users, setUsers] = useState<any[]>([])
	const [total, setTotal] = useState(0)
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

	const adminId: string = (session as any)?.currentUser?._id ?? session?.user?.id ?? ''

	const load = async (q = search) => {
		if (!adminId) return
		setLoading(true)
		const res = await getAdminUsersAction({ userId: adminId, search: q })
		if (res?.data?.users) {
			setUsers(res.data.users)
			setTotal(res.data.total ?? res.data.users.length)
		}
		setLoading(false)
	}

	useEffect(() => {
		if (status === 'loading' || !adminId) return
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminId, status])

	const handleVerify = async (userId: string, verify: boolean) => {
		setActionLoading(userId)
		const action = verify ? verifyUserAction : unverifyUserAction
		const res = await action({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: verify } : u))
			toast.success(verify ? 'User verified.' : 'User unverified.')
		} else {
			toast.error(res?.data?.failure || 'Failed.')
		}
		setActionLoading(null)
	}

	const handleRole = async (userId: string, currentRole: string) => {
		const newRole = currentRole === 'admin' ? 'user' : 'admin'
		setActionLoading(userId + '-role')
		const res = await updateUserRoleAction({ adminId, targetUserId: userId, role: newRole })
		if (res?.data?.success) {
			setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
			toast.success(`Role changed to ${newRole}.`)
		} else {
			toast.error(res?.data?.failure || 'Failed.')
		}
		setActionLoading(null)
	}

	const handleDelete = async (userId: string) => {
		setActionLoading(userId + '-del')
		const res = await deleteUserAction({ adminId, targetUserId: userId })
		if (res?.data?.success) {
			setUsers(prev => prev.filter(u => u._id !== userId))
			toast.success('User deleted.')
		} else {
			toast.error(res?.data?.failure || 'Failed.')
		}
		setActionLoading(null)
		setConfirmDelete(null)
	}

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
						<Users className='w-6 h-6 text-pink-500' /> Users
					</h1>
					<p className='text-gray-500 text-sm mt-0.5'>{total} total users</p>
				</div>
				<button
					onClick={() => load()}
					className='p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors'
					title='Refresh'
				>
					<RefreshCw className='w-4 h-4 text-gray-500' />
				</button>
			</div>

			{/* Search */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
				<input
					type='text'
					placeholder='Search by name or email…'
					value={search}
					onChange={e => setSearch(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && load(search)}
					className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
				/>
			</div>

			{/* Delete confirm modal */}
			{confirmDelete && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4'>
						<h3 className='font-bold text-gray-900'>Delete user?</h3>
						<p className='text-sm text-gray-500'>This will soft-delete the user. They will not be able to log in.</p>
						<div className='flex gap-3'>
							<button onClick={() => setConfirmDelete(null)} className='flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold'>Cancel</button>
							<button
								onClick={() => handleDelete(confirmDelete)}
								disabled={!!actionLoading}
								className='flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60'
							>
								{actionLoading ? '…' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
				{loading ? (
					<div className='p-12 flex justify-center'>
						<div className='w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin' />
					</div>
				) : users.length === 0 ? (
					<p className='p-12 text-center text-sm text-gray-400'>No users found.</p>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full text-sm'>
							<thead>
								<tr className='bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
									<th className='px-5 py-3 text-left'>User</th>
									<th className='px-5 py-3 text-left'>Plan</th>
									<th className='px-5 py-3 text-left'>Status</th>
									<th className='px-5 py-3 text-left'>Role</th>
									<th className='px-5 py-3 text-left'>Joined</th>
									<th className='px-5 py-3 text-right'>Actions</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-50'>
								{users.map((u: any) => (
									<tr key={u._id} className='hover:bg-gray-50/50 transition-colors'>
										<td className='px-5 py-3.5'>
											<div className='flex items-center gap-2.5'>
												<div className='w-8 h-8 rounded-full factyo-gradient flex items-center justify-center text-white text-xs font-bold shrink-0'>
													{u.fullName?.charAt(0)?.toUpperCase() ?? '?'}
												</div>
												<div>
													<p className='font-semibold text-gray-900'>{u.fullName}</p>
													<p className='text-xs text-gray-400'>{u.email}</p>
												</div>
											</div>
										</td>
										<td className='px-5 py-3.5'>
											<span className='text-xs font-semibold px-2 py-0.5 rounded-full border capitalize' style={{ color: planColor[u.plan] || '#9ca3af', borderColor: planColor[u.plan] || '#9ca3af', background: `${planColor[u.plan] || '#9ca3af'}18` }}>
												{u.plan}
											</span>
										</td>
										<td className='px-5 py-3.5'>
											<span className={`flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full ${u.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'}`}>
												{u.isVerified ? <CheckCircle className='w-3 h-3' /> : <XCircle className='w-3 h-3' />}
												{u.isVerified ? 'Verified' : 'Unverified'}
											</span>
										</td>
										<td className='px-5 py-3.5'>
											<span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${u.role === 'admin' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
												{u.role}
											</span>
										</td>
										<td className='px-5 py-3.5 text-xs text-gray-400'>
											{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
										</td>
										<td className='px-5 py-3.5'>
											<div className='flex items-center justify-end gap-1.5'>
												<button
													onClick={() => handleVerify(u._id, !u.isVerified)}
													disabled={actionLoading === u._id}
													title={u.isVerified ? 'Unverify' : 'Verify'}
													className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.isVerified ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'}`}
												>
													{u.isVerified ? <XCircle className='w-4 h-4' /> : <CheckCircle className='w-4 h-4' />}
												</button>
												<button
													onClick={() => handleRole(u._id, u.role)}
													disabled={actionLoading === u._id + '-role'}
													title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
													className='p-1.5 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50'
												>
													<Shield className='w-4 h-4' />
												</button>
												<button
													onClick={() => setConfirmDelete(u._id)}
													disabled={!!actionLoading}
													title='Delete user'
													className='p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50'
												>
													<Trash2 className='w-4 h-4' />
												</button>
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
