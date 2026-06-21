'use client'

import { Settings, Info } from 'lucide-react'

export default function AdminSettingsPage() {
	return (
		<div className='max-w-2xl mx-auto space-y-8'>
			<div>
				<h1 className='text-2xl font-extrabold text-gray-900 flex items-center gap-2'>
					<Settings className='w-6 h-6 text-pink-500' /> System Settings
				</h1>
				<p className='text-gray-500 text-sm mt-0.5'>Global platform configuration</p>
			</div>

			<div className='rounded-2xl p-5 bg-blue-50 border border-blue-100 flex items-start gap-3'>
				<Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
				<div>
					<p className='text-sm text-blue-800 font-semibold'>Email verification is disabled</p>
					<p className='text-xs text-blue-600 mt-0.5'>
						New users are automatically verified on registration. No OTP codes are sent.
					</p>
				</div>
			</div>
		</div>
	)
}
