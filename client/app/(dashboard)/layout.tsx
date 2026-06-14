'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
	FileText,
	LayoutDashboard,
	Users,
	Settings,
	LogOut,
	Menu,
	Plus,
} from 'lucide-react'
import { ChildProps } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function DashboardLayout({ children }: ChildProps) {
	const { t } = useLanguage()
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const [sidebarOpen, setSidebarOpen] = useState(false)

	useEffect(() => {
		if (status === 'unauthenticated') router.push('/login')
	}, [status, router])

	if (status === 'loading') {
		return (
			<div className='min-h-screen flex items-center justify-center' style={{ background: '#0d0819' }}>
				<div className='w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin' />
			</div>
		)
	}

	if (status === 'unauthenticated') return null

	const user = (session as any)?.currentUser
	const plan = user?.plan ?? 'free'
	const planLabel = plan === 'free' ? t('settings.planFree') : plan === 'basic' ? t('settings.planBasic') : t('settings.planUnlimited')
	const planColor = plan === 'free' ? '#9ca3af' : plan === 'basic' ? '#60a5fa' : '#FF2D78'

	const navItems = [
		{ labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ labelKey: 'nav.invoices', href: '/dashboard/invoices', icon: FileText },
		{ labelKey: 'nav.clients', href: '/dashboard/clients', icon: Users },
		{ labelKey: 'nav.settings', href: '/dashboard/settings', icon: Settings },
	]

	const SidebarContent = () => (
		<div className='flex flex-col h-full'>
			{/* Logo */}
			<div className='px-5 py-5 border-b border-white/5'>
				<Link href='/' className='flex items-center gap-2.5' onClick={() => setSidebarOpen(false)}>
					<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center shrink-0'>
						<FileText className='w-4 h-4 text-white' />
					</div>
					<span className='font-extrabold text-lg text-white tracking-tight'>
						Fact<span style={{ color: '#FF2D78' }}>yo</span>
					</span>
				</Link>
			</div>

			{/* Create Invoice CTA */}
			<div className='px-4 py-4'>
				<Link
					href='/dashboard/invoices/create'
					onClick={() => setSidebarOpen(false)}
					className='flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
				>
					<Plus className='w-4 h-4' /> {t('nav.newInvoice')}
				</Link>
			</div>

			{/* Nav */}
			<nav className='flex-1 px-3 space-y-0.5'>
				{navItems.map(({ labelKey, href, icon: Icon }) => {
					const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
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
							{t(labelKey)}
						</Link>
					)
				})}
			</nav>

			{/* User + plan */}
			<div className='px-4 py-4 border-t border-white/5 space-y-3'>
				<div className='flex items-center gap-3'>
					<div className='w-9 h-9 rounded-full factyo-gradient flex items-center justify-center text-white font-bold text-sm shrink-0'>
						{user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
					</div>
					<div className='min-w-0 flex-1'>
						<p className='text-white text-sm font-semibold truncate'>{user?.fullName ?? 'User'}</p>
						<p className='text-white/40 text-xs truncate'>{user?.email}</p>
					</div>
				</div>
				<div className='flex items-center justify-between px-1'>
					<span className='text-xs font-semibold rounded-full px-2 py-0.5 border' style={{ color: planColor, borderColor: planColor, background: `${planColor}18` }}>
						{planLabel} {t('settings.planLabel')}
					</span>
					<button
						onClick={() => signOut({ callbackUrl: '/' })}
						className='flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors'
					>
						<LogOut className='w-3.5 h-3.5' /> {t('nav.signOut')}
					</button>
				</div>
			</div>
		</div>
	)

	return (
		<div className='flex h-screen overflow-hidden' style={{ background: '#f8f9fa' }}>
			{/* Desktop sidebar */}
			<aside className='hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0' style={{ background: '#0d0819' }}>
				<SidebarContent />
			</aside>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div className='fixed inset-0 z-50 md:hidden'>
					<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setSidebarOpen(false)} />
					<aside className='absolute left-0 top-0 bottom-0 w-64 flex flex-col' style={{ background: '#0d0819' }}>
						<SidebarContent />
					</aside>
				</div>
			)}

			{/* Main */}
			<div className='flex-1 flex flex-col min-h-0 overflow-auto'>
				{/* Mobile top bar */}
				<div className='md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-40'>
					<Link href='/' className='flex items-center gap-2'>
						<div className='w-7 h-7 rounded-lg factyo-gradient flex items-center justify-center'>
							<FileText className='w-3.5 h-3.5 text-white' />
						</div>
						<span className='font-extrabold text-base tracking-tight'>
							Fact<span style={{ color: '#FF2D78' }}>yo</span>
						</span>
					</Link>
					<button onClick={() => setSidebarOpen(true)} className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'>
						<Menu className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				<main className='flex-1 p-6'>
					{children}
				</main>
			</div>
		</div>
	)
}
