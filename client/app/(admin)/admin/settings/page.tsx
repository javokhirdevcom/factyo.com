'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getAdminSettingsAction, updateAdminSettingsAction } from '@/actions/admin.action'
import { toast } from 'sonner'
import { Settings, Mail, ToggleLeft, ToggleRight, Info } from 'lucide-react'

export default function AdminSettingsPage() {
	const { data: session, status } = useSession()
	const [otpEnabled, setOtpEnabled] = useState(true)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	const adminId: string = (session as any)?.currentUser?._id ?? session?.user?.id ?? ''

	useEffect(() => {
		if (status === 'loading' || !adminId) return
		const load = async () => {
			const res = await getAdminSettingsAction({ userId: adminId })
			if (res?.data?.settings) {
				setOtpEnabled(res.data.settings.otpEnabled !== false)
			} else if (res?.data?.failure) {
				toast.error('Access denied: ' + res.data.failure)
			} else if (res?.serverError) {
				toast.error('Server error: ' + res.serverError)
			}
			setLoading(false)
		}
		load()
	}, [adminId, status])

	const handleToggleOtp = async (value: boolean) => {
		setSaving(true)
		const res = await updateAdminSettingsAction({ userId: adminId, otpEnabled: value })
		if (res?.data?.success) {
			setOtpEnabled(res.data.settings.otpEnabled)
			toast.success(value ? 'OTP verification enabled.' : 'OTP verification disabled — users auto-verified.')
		} else {
			toast.error(res?.data?.failure || 'Failed to save.')
		}
		setSaving(false)
	}

	return (
		<div className='max-w-2xl mx-auto space-y-8'>
			<div>
				<h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
					<Settings className='w-6 h-6 text-pink-500' /> System Settings
				</h1>
				<p className='text-gray-500 text-sm mt-0.5'>Global platform configuration</p>
			</div>

			{loading ? (
				<div className='flex justify-center py-16'>
					<div className='w-7 h-7 rounded-full border-2 border-pink-400 border-t-transparent animate-spin' />
				</div>
			) : (
				<div className='space-y-4'>
					{/* OTP toggle */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
						<div className='flex items-start justify-between gap-6'>
							<div className='flex items-start gap-3'>
								<div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0'>
									<Mail className='w-5 h-5 text-blue-500' />
								</div>
								<div>
									<p className='font-bold text-gray-900'>Email OTP Verification</p>
									<p className='text-sm text-gray-500 mt-0.5'>
										When enabled, users must verify their email via a 6-digit code before accessing the platform.
									</p>
									<p className='text-xs text-amber-600 mt-2 flex items-center gap-1.5 font-medium'>
										<Info className='w-3.5 h-3.5 shrink-0' />
										{otpEnabled
											? 'Currently ON — users must verify their email to sign up/log in.'
											: 'Currently OFF — new users are auto-verified. Use this while setting up email delivery.'}
									</p>
								</div>
							</div>
							<button
								onClick={() => handleToggleOtp(!otpEnabled)}
								disabled={saving}
								className='shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60'
								style={{
									background: otpEnabled ? 'rgba(255,45,120,0.1)' : 'rgba(16,185,129,0.1)',
									color: otpEnabled ? '#FF2D78' : '#10b981',
								}}
							>
								{otpEnabled ? (
									<><ToggleRight className='w-5 h-5' /> Enabled</>
								) : (
									<><ToggleLeft className='w-5 h-5' /> Disabled</>
								)}
							</button>
						</div>
					</div>

					{/* Info card */}
					<div className='rounded-2xl p-4 bg-blue-50 border border-blue-100'>
						<p className='text-sm text-blue-800 font-semibold mb-1'>Tip: Use OTP OFF while testing</p>
						<p className='text-xs text-blue-600'>
							Disable OTP while configuring your Resend domain. Once email delivery is confirmed working, turn OTP back on for production security.
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
