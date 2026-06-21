'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FileText, LayoutDashboard, Users, Settings, LogOut, Menu, Shield, CreditCard } from 'lucide-react'
import { ChildProps } from '@/types'

const navItems = [
	{ label: 'Overview', href: '/admin', icon: LayoutDashboard },
	{ label: 'Users', href: '/admin/users', icon: Users },
	{ label: 'Payments', href: '/admin/payments', icon: CreditCard },
	{ label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: ChildProps) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const [sidebarOpen, setSidebarOpen] = useState(false)

	useEffect(() => {
		if (status === 'unauthenticated') { router.push('/login'); return }
		const role = (session as any)?.currentUser?.role ?? (session?.user as any)?.role
		if (status === 'authenticated' && role !== 'admin') router.push('/dashboard')
	}, [status, session, router])

	if (status === 'loading') {
		return (
			<div className='min-h-screen flex items-center justify-center' style={{ background: '#0d0819' }}>
				<div className='w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin' />
			</div>
		)
	}

	const user = (session as any)?.currentUser
	const role = user?.role ?? (session?.user as any)?.role
	if (role !== 'admin') return null

	const SidebarContent = () => (
		<div className='flex flex-col h-full'>
			<div className='px-5 py-5 border-b border-white/5'>
				<Link href='/' className='flex items-center gap-2.5'>
					<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center shrink-0'>
						<FileText className='w-4 h-4 text-white' />
					</div>
					<span className='font-extrabold text-lg text-white tracking-tight'>
						Fact<span style={{ color: '#FF2D78' }}>yo</span>
					</span>
				</Link>
				<div className='mt-2 flex items-center gap-1.5 px-1'>
					<Shield className='w-3.5 h-3.5 text-pink-400' />
					<span className='text-xs font-bold text-pink-400 uppercase tracking-widest'>Admin Panel</span>
				</div>
			</div>

			<nav className='flex-1 px-3 py-4 space-y-0.5'>
				{navItems.map(({ label, href, icon: Icon }) => {
					const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
					return (
						<Link
							key={href}
							href={href}
							onClick={() => setSidebarOpen(false)}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
								active ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
							}`}
							style={active ? { background: 'rgba(255,45,120,0.15)', color: '#FF2D78' } : {}}
						>
							<Icon className='w-4 h-4 shrink-0' style={active ? { color: '#FF2D78' } : {}} />
							{label}
						</Link>
					)
				})}
				<Link
					href='/dashboard'
					className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 transition-all mt-4 border-t border-white/5 pt-4'
				>
					<LayoutDashboard className='w-4 h-4 shrink-0' />
					Back to Dashboard
				</Link>
			</nav>

			<div className='px-4 py-4 border-t border-white/5 space-y-2'>
				<div className='flex items-center gap-3'>
					<div className='w-8 h-8 rounded-full factyo-gradient flex items-center justify-center text-white font-bold text-sm shrink-0'>
						{user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
					</div>
					<div className='min-w-0 flex-1'>
						<p className='text-white text-sm font-semibold truncate'>{user?.fullName ?? 'Admin'}</p>
						<p className='text-pink-400 text-xs font-bold'>Administrator</p>
					</div>
				</div>
				<button
					onClick={() => signOut({ callbackUrl: '/' })}
					className='flex items-center gap-2 w-full text-xs text-white/40 hover:text-white/70 transition-colors px-1'
				>
					<LogOut className='w-3.5 h-3.5' /> Sign out
				</button>
			</div>
		</div>
	)

	return (
		<div className='flex h-screen overflow-hidden' style={{ background: '#f8f9fa' }}>
			<aside className='hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0' style={{ background: '#0d0819' }}>
				<SidebarContent />
			</aside>

			{sidebarOpen && (
				<div className='fixed inset-0 z-50 md:hidden'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setSidebarOpen(false)} />
					<aside className='absolute left-0 top-0 bottom-0 w-64 flex flex-col' style={{ background: '#0d0819' }}>
						<SidebarContent />
					</aside>
				</div>
			)}

			<div className='flex-1 flex flex-col min-h-0 overflow-auto'>
				<div className='md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-40'>
					<div className='flex items-center gap-2'>
						<Shield className='w-4 h-4 text-pink-500' />
						<span className='font-bold text-sm'>Admin Panel</span>
					</div>
					<button onClick={() => setSidebarOpen(true)} className='p-1.5 rounded-lg hover:bg-gray-100'>
						<Menu className='w-5 h-5 text-gray-600' />
					</button>
				</div>
				<main className='flex-1 p-6'>{children}</main>
			</div>
		</div>
	)
}
