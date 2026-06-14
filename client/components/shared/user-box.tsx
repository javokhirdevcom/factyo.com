'use client'

import { IUser } from '@/types'
import { CreditCard, LogOut, Settings, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { FC } from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
	user: IUser
}

const UserBox: FC<Props> = ({ user }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className='flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3 shadow-sm hover:bg-gray-100 transition-all outline-none'>
					<div className='flex h-7 w-7 items-center justify-center rounded-full factyo-gradient text-xs font-bold text-white shrink-0'>
						{user.fullName?.charAt(0).toUpperCase() || 'U'}
					</div>
					<span className='text-xs font-semibold text-gray-800 hidden sm:block truncate max-w-24'>
						{user.fullName}
					</span>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className='w-52' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<p className='text-sm font-semibold text-gray-900 truncate'>{user.fullName}</p>
					<p className='text-xs text-gray-400 truncate'>{user.email}</p>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem asChild className='cursor-pointer'>
						<Link href='/dashboard/settings'>
							<User className='mr-2 h-4 w-4 text-gray-400' />Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className='cursor-pointer'>
						<Link href='/pricing'>
							<CreditCard className='mr-2 h-4 w-4 text-gray-400' />
							{user.plan ? `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan` : 'Upgrade'}
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className='cursor-pointer'>
						<Link href='/dashboard/settings'>
							<Settings className='mr-2 h-4 w-4 text-gray-400' />Settings
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className='text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer'
					onClick={() => signOut({ callbackUrl: '/' })}
				>
					<LogOut className='mr-2 h-4 w-4' />Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default UserBox
