'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { login, sendOtpEmail, verifyOtpCode } from '@/actions/auth.action'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema } from '@/lib/validation'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { toast } from 'sonner'
import { FileText, Mail } from 'lucide-react'

type Step = 'login' | 'otp'

export default function LoginPage() {
	const { t } = useLanguage()
	const { status } = useSession()
	const router = useRouter()
	const [step, setStep] = useState<Step>('login')
	const [isLoading, setIsLoading] = useState(false)
	const [isResending, setIsResending] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)
	const [appleLoading, setAppleLoading] = useState(false)
	const [otpValue, setOtpValue] = useState('')
	const [registeredEmail, setRegisteredEmail] = useState('')
	const [pendingUserId, setPendingUserId] = useState('')

	// Redirect already-authenticated users
	useEffect(() => {
		if (status === 'authenticated') {
			router.replace('/dashboard')
		}
	}, [status, router])

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	})

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		setIsLoading(true)
		try {
			const res = await login(values)

			if (res?.serverError || res?.validationErrors || !res?.data) {
				toast.error(res?.serverError || t('common.error'))
				return
			}

			if (res.data.failure === 'Please verify your email before logging in.') {
				// Auto-send OTP and switch to verify step
				const otpRes = await sendOtpEmail({ email: values.email })
				if (otpRes?.serverError) {
					toast.error('Failed to send verification code. Please try again.')
					return
				}
				setRegisteredEmail(values.email)
				setStep('otp')
				toast.info('A verification code has been sent to your email.')
				return
			}

			if (res.data.failure) {
				toast.error(res.data.failure)
				return
			}

			if (res.data.user) {
				await signIn('credentials', {
					userId: res.data.user._id,
					callbackUrl: '/dashboard',
					redirect: true,
				})
			}
		} catch {
			toast.error(t('common.error'))
		} finally {
			setIsLoading(false)
		}
	}

	async function handleVerifyOtp() {
		if (otpValue.length !== 6) {
			toast.error(t('auth.otp.invalidLength'))
			return
		}
		setIsLoading(true)
		try {
			const res = await verifyOtpCode({ email: registeredEmail, otp: otpValue })
			if (res?.serverError || res?.validationErrors) {
				toast.error(res?.serverError || t('common.error'))
				return
			}
			if (res?.data?.failure) {
				toast.error(res.data.failure)
				return
			}
			// Verified — sign in directly
			if (res?.data?.user) {
				await signIn('credentials', {
					userId: res.data.user._id,
					callbackUrl: '/dashboard',
					redirect: true,
				})
			}
		} catch {
			toast.error(t('common.error'))
		} finally {
			setIsLoading(false)
		}
	}

	async function handleResend() {
		setIsResending(true)
		try {
			const otpRes = await sendOtpEmail({ email: registeredEmail })
			if (otpRes?.serverError) {
				toast.error(t('common.error'))
			} else {
				toast.success('Code resent!')
			}
		} catch {
			toast.error(t('common.error'))
		} finally {
			setIsResending(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setGoogleLoading(true)
		try {
			await signIn('google', { callbackUrl: '/dashboard' })
		} catch {
			toast.error(t('common.error'))
			setGoogleLoading(false)
		}
	}

	const handleAppleSignIn = async () => {
		setAppleLoading(true)
		try {
			await signIn('apple', { callbackUrl: '/dashboard' })
		} catch {
			toast.error(t('common.error'))
			setAppleLoading(false)
		}
	}

	if (status === 'loading' || status === 'authenticated') {
		return (
			<div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(160deg,#0d0819 0%,#1a0a2e 100%)' }}>
				<div className='w-7 h-7 rounded-full border-2 border-pink-500 border-t-transparent animate-spin' />
			</div>
		)
	}

	return (
		<div className='min-h-screen flex' style={{ background: 'linear-gradient(160deg,#0d0819 0%,#1a0a2e 100%)' }}>
			{/* Left panel */}
			<div className='hidden lg:flex flex-col justify-between w-105 shrink-0 p-10 border-r border-white/5'>
				<Link href='/' className='flex items-center gap-2'>
					<div className='w-9 h-9 rounded-xl factyo-gradient flex items-center justify-center'>
						<FileText className='w-5 h-5 text-white' />
					</div>
					<span className='font-extrabold text-xl text-white tracking-tight'>
						Fact<span style={{ color: '#FF2D78' }}>yo</span>
					</span>
				</Link>
				<div className='space-y-4'>
					<p className='text-3xl font-extrabold text-white leading-snug'>
						Welcome back.<br />
						<span style={{ color: '#FF2D78' }}>Get paid faster.</span>
					</p>
					<p className='text-white/50 text-sm'>
						Log in to access your invoices, clients, and settings.
					</p>
				</div>
				<p className='text-white/20 text-xs'>&copy; {new Date().getFullYear()} Factyo</p>
			</div>

			{/* Right panel */}
			<div className='flex-1 flex items-center justify-center p-6'>
				<div className='w-full max-w-sm space-y-6'>
					{/* Mobile logo */}
					<Link href='/' className='flex lg:hidden items-center gap-2 justify-center'>
						<div className='w-8 h-8 rounded-lg factyo-gradient flex items-center justify-center'>
							<FileText className='w-4 h-4 text-white' />
						</div>
						<span className='font-extrabold text-xl text-white tracking-tight'>
							Fact<span style={{ color: '#FF2D78' }}>yo</span>
						</span>
					</Link>

					{step === 'login' ? (
						<>
							<div>
								<h1 className='text-2xl font-extrabold text-white'>{t('auth.login.title')}</h1>
								<p className='text-white/50 text-sm mt-1'>
									{t('auth.login.subtitlePre')}{' '}
									<Link href='/register' className='font-semibold hover:underline' style={{ color: '#FF2D78' }}>
										{t('auth.login.signUp')}
									</Link>
								</p>
							</div>

							{/* OAuth buttons */}
							<div className='space-y-3'>
								<button
									onClick={handleGoogleSignIn}
									disabled={googleLoading || isLoading}
									className='w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors disabled:opacity-50'
								>
									<svg viewBox='0 0 24 24' className='w-4 h-4' aria-hidden='true'>
										<path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
										<path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
										<path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
										<path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
									</svg>
									{googleLoading ? '…' : t('auth.continueWithGoogle')}
								</button>

								<button
									onClick={handleAppleSignIn}
									disabled={appleLoading || isLoading}
									className='w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors disabled:opacity-50'
								>
									<svg viewBox='0 0 24 24' className='w-4 h-4 fill-white' aria-hidden='true'>
										<path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z'/>
									</svg>
									{appleLoading ? '…' : t('auth.continueWithApple')}
								</button>
							</div>

							{/* Divider */}
							<div className='relative flex items-center'>
								<div className='flex-1 border-t border-white/10' />
								<span className='mx-3 text-xs text-white/30'>{t('auth.orContinueWith')}</span>
								<div className='flex-1 border-t border-white/10' />
							</div>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
									<FormField
										control={form.control}
										name='email'
										render={({ field }) => (
											<FormItem>
												<FormLabel className='text-white/70 text-sm'>{t('auth.login.email')}</FormLabel>
												<FormControl>
													<Input
														placeholder='you@example.com'
														type='email'
														disabled={isLoading}
														{...field}
														className='bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500'
													/>
												</FormControl>
												<FormMessage className='text-xs text-red-400' />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name='password'
										render={({ field }) => (
											<FormItem>
												<FormLabel className='text-white/70 text-sm'>{t('auth.login.password')}</FormLabel>
												<FormControl>
													<Input
														placeholder='••••••••'
														type='password'
														disabled={isLoading}
														{...field}
														className='bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500'
													/>
												</FormControl>
												<FormMessage className='text-xs text-red-400' />
											</FormItem>
										)}
									/>
									<Button
										type='submit'
										disabled={isLoading}
										className='w-full factyo-gradient text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity'
									>
										{isLoading ? t('auth.login.loading') : t('auth.login.submit')}
									</Button>
								</form>
							</Form>
						</>
					) : (
						/* OTP verification step */
						<div className='space-y-6'>
							<div className='flex flex-col items-center text-center space-y-3'>
								<div className='w-16 h-16 rounded-full factyo-gradient flex items-center justify-center'>
									<Mail className='w-8 h-8 text-white' />
								</div>
								<h1 className='text-2xl font-extrabold text-white'>{t('auth.otp.title')}</h1>
								<p className='text-white/50 text-sm'>
									{t('auth.otp.subtitlePre')}{' '}
									<span className='font-semibold' style={{ color: '#FF2D78' }}>{registeredEmail}</span>
								</p>
							</div>

							<div className='space-y-4'>
								<Input
									type='text'
									inputMode='numeric'
									maxLength={6}
									value={otpValue}
									onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
									placeholder={t('auth.otp.placeholder')}
									disabled={isLoading}
									className='bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500 text-center text-2xl tracking-[0.5em] font-bold h-14'
								/>

								<Button
									onClick={handleVerifyOtp}
									disabled={isLoading || otpValue.length !== 6}
									className='w-full factyo-gradient text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity'
								>
									{isLoading ? t('auth.otp.verifying') : t('auth.otp.verify')}
								</Button>

								<div className='flex items-center justify-between text-sm'>
									<button
										type='button'
										onClick={() => { setStep('login'); setOtpValue('') }}
										className='text-white/40 hover:text-white/70 transition-colors'
									>
										← {t('auth.otp.back')}
									</button>
									<button
										type='button'
										onClick={handleResend}
										disabled={isResending}
										className='font-semibold hover:underline transition-colors'
										style={{ color: '#FF2D78' }}
									>
										{isResending ? t('auth.otp.resending') : t('auth.otp.resend')}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
