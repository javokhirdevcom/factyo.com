'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FileText, LayoutDashboard, LogOut } from 'lucide-react'

const Navbar = () => {
	const { data: session, status } = useSession()

	return (
		<nav className='sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md'>
			<div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
				<Link href='/' className='flex items-center gap-2'>
					<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center'>
						<FileText className='w-4 h-4 text-white' />
					</div>
					<span className='font-extrabold text-xl tracking-tight text-gray-900'>
						Fact<span style={{ color: '#FF2D78' }}>yo</span>
					</span>
				</Link>

				<div className='flex items-center gap-3'>
					{status === 'authenticated' ? (
						<>
							<Link
								href='/dashboard'
								className='flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'
							>
								<LayoutDashboard className='w-4 h-4' /> Dashboard
							</Link>
							<button
								onClick={() => signOut({ callbackUrl: '/' })}
								className='p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors'
								title='Sign out'
							>
								<LogOut className='w-4 h-4' />
							</button>
						</>
					) : (
						<>
							<Link href='/login' className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'>
								Log in
							</Link>
							<Link
								href='/register'
								className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white factyo-gradient hover:opacity-90 transition-opacity'
							>
								Get Started Free
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navbar
