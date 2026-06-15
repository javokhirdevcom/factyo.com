'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
import { updateProfileAction, updateLogoAction } from '@/actions/auth.action'
import { cancelSubscriptionAction } from '@/actions/stripe.action'
import { profileSchema } from '@/lib/validation'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { LANG_LABELS, Lang } from '@/lib/i18n/translations'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Building2, CreditCard, ArrowRight, Globe, Upload, User, X } from 'lucide-react'
import Link from 'next/link'
import { useUploadThing } from '@/lib/uploadthing'

type FormValues = z.infer<typeof profileSchema>

const LANGS = Object.entries(LANG_LABELS) as [Lang, string][]

export default function SettingsPage() {
	const { t, lang, setLang } = useLanguage()
	const { data: session, update } = useSession()
	const [saving, setSaving] = useState(false)
	const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
	const [cancelling, setCancelling] = useState(false)
	const [logoUploading, setLogoUploading] = useState(false)
	const user = (session as any)?.currentUser
	const userId: string | undefined = user?._id ?? session?.user?.id

	const form = useForm<FormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: user?.fullName ?? '',
			businessName: user?.businessName ?? '',
			businessAddress: user?.businessAddress ?? '',
			vatNumber: user?.vatNumber ?? '',
			kvkNumber: user?.kvkNumber ?? '',
			phone: user?.phone ?? '',
			website: user?.website ?? '',
			iban: user?.iban ?? '',
			bic: user?.bic ?? '',
		},
	})

	const { startUpload: startLogoUpload } = useUploadThing('logoUploader')

	async function onSubmit(values: FormValues) {
		setSaving(true)
		const res = await updateProfileAction({ userId: userId!, ...values })
		if (res?.data?.user) {
			toast.success(t('settings.saved'))
			await update()
		} else {
			toast.error(res?.data?.failure || t('common.error'))
		}
		setSaving(false)
	}

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		setLogoUploading(true)
		try {
			const res = await startLogoUpload([file])
			const url = res?.[0]?.url
			if (url) {
				await updateLogoAction({ userId: userId!, logoUrl: url })
				toast.success(t('settings.uploadSuccess'))
				await update()
			}
		} catch {
			toast.error(t('common.error'))
		}
		setLogoUploading(false)
	}

	const handleCancelSubscription = async () => {
		setCancelling(true)
		const res = await cancelSubscriptionAction({ userId: userId! })
		if (res?.data?.success) {
			toast.success(t('settings.cancelled'))
			await update()
			setCancelConfirmOpen(false)
		} else {
			toast.error(res?.data?.failure || t('common.error'))
		}
		setCancelling(false)
	}

	const plan = user?.plan ?? 'free'
	const planLabel = plan === 'free' ? t('settings.planFree') : plan === 'basic' ? t('settings.planBasic') : t('settings.planUnlimited')
	const planColor = plan === 'free' ? '#9ca3af' : plan === 'basic' ? '#3b82f6' : '#FF2D78'

	return (
		<div className='max-w-2xl mx-auto space-y-8'>
			{/* Cancel confirm modal */}
			{cancelConfirmOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4'>
						<div className='flex items-center justify-between'>
							<h3 className='font-bold text-gray-900'>{t('settings.cancelSubscription')}</h3>
							<button onClick={() => setCancelConfirmOpen(false)} className='text-gray-400 hover:text-gray-600'>
								<X className='w-5 h-5' />
							</button>
						</div>
						<p className='text-sm text-gray-500'>{t('settings.cancelConfirm')}</p>
						<div className='flex gap-3'>
							<button
								onClick={() => setCancelConfirmOpen(false)}
								className='flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'
							>
								{t('common.cancel')}
							</button>
							<button
								onClick={handleCancelSubscription}
								disabled={cancelling}
								className='flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60'
							>
								{cancelling ? t('settings.cancelling') : t('settings.cancelSubscription')}
							</button>
						</div>
					</div>
				</div>
			)}

			<div>
				<h1 className='text-2xl font-extrabold text-gray-900'>{t('settings.title')}</h1>
				<p className='text-gray-500 text-sm mt-0.5'>{t('settings.subtitle')}</p>
			</div>

			{/* Language selector */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
				<h2 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
					<Globe className='w-4 h-4 text-gray-400' /> {t('settings.language')}
				</h2>
				<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
					{LANGS.map(([code, label]) => (
						<button
							key={code}
							onClick={() => setLang(code)}
							className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
								lang === code
									? 'text-white border-transparent factyo-gradient shadow-md'
									: 'border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600 bg-white'
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Company Logo */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
				<h2 className='font-bold text-gray-900 flex items-center gap-2'>
					<Upload className='w-4 h-4 text-gray-400' /> {t('settings.logo')}
				</h2>
				<div className='flex items-center gap-5'>
					<div className='w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200 shrink-0'>
						{user?.logoUrl ? (
							<Image src={user.logoUrl} alt='logo' width={80} height={80} className='w-full h-full object-contain p-1' />
						) : (
							<Building2 className='w-8 h-8 text-gray-400' />
						)}
					</div>
					<div className='space-y-1'>
						<p className='text-sm font-semibold text-gray-700'>{t('settings.logo')}</p>
						<p className='text-xs text-gray-400'>{t('settings.logoHint')}</p>
						<div className='flex gap-2 mt-2'>
							<label className='cursor-pointer px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors'>
								{logoUploading ? t('settings.uploading') : t('settings.uploadLogo')}
								<input type='file' accept='image/*' className='hidden' onChange={handleLogoUpload} disabled={logoUploading} />
							</label>
							{user?.logoUrl && (
								<button
									type='button'
									onClick={async () => {
										await updateLogoAction({ userId: userId!, logoUrl: '' })
										toast.success(t('settings.saved'))
										await update()
									}}
									className='px-3 py-2 rounded-xl border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors'
								>
									{t('settings.removeLogo')}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Current plan */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
				<h2 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
					<CreditCard className='w-4 h-4 text-gray-400' /> {t('settings.subscription')}
				</h2>
				<div className='flex items-center justify-between'>
					<div>
						<span className='text-sm font-semibold rounded-full px-3 py-1 border' style={{ color: planColor, borderColor: planColor, background: `${planColor}18` }}>
							{planLabel} {t('settings.planLabel')}
						</span>
						<p className='text-xs text-gray-400 mt-2'>
							{plan === 'free' && `${user?.invoiceCount ?? 0}/3 ${t('settings.planFreeInvoices')}`}
							{plan === 'basic' && `${user?.invoiceCount ?? 0}/10 ${t('settings.planBasicInvoices')}`}
							{plan === 'unlimited' && t('settings.planUnlimitedInvoices')}
						</p>
					</div>
					<div className='flex gap-2'>
						{plan !== 'free' && (
							<button
								onClick={() => setCancelConfirmOpen(true)}
								className='px-3 py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors'
							>
								{t('settings.cancelSubscription')}
							</button>
						)}
						{plan !== 'unlimited' && (
							<Link
								href='/pricing'
								className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
							>
								{t('settings.upgrade')} <ArrowRight className='w-4 h-4' />
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Profile form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					{/* Personal info */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
						<h2 className='font-bold text-gray-900 flex items-center gap-2'>
							<User className='w-4 h-4 text-gray-400' /> {t('settings.personalInfo')}
						</h2>
						<FormField
							control={form.control}
							name='fullName'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-sm text-gray-600'>{t('settings.fullName')}</FormLabel>
									<FormControl>
										<Input {...field} className='rounded-xl border-gray-200' />
									</FormControl>
									<FormMessage className='text-xs text-red-500' />
								</FormItem>
							)}
						/>
						<div>
							<label className='text-sm text-gray-600 block mb-1.5'>Email</label>
							<Input value={user?.email ?? ''} disabled className='rounded-xl border-gray-200 bg-gray-50 text-gray-400' />
							<p className='text-xs text-gray-400 mt-1'>{t('settings.emailCannotChange')}</p>
						</div>
					</div>

					{/* Business info */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
						<h2 className='font-bold text-gray-900 flex items-center gap-2'>
							<Building2 className='w-4 h-4 text-gray-400' /> {t('settings.businessInfo')}
							<span className='text-xs font-normal text-gray-400'>{t('settings.businessInfoHint')}</span>
						</h2>
						<div className='grid sm:grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='businessName'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.businessName')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.businessNamePlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='vatNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.vatNumber')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.vatPlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name='businessAddress'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-sm text-gray-600'>{t('settings.businessAddress')}</FormLabel>
									<FormControl>
										<Input placeholder={t('settings.addressPlaceholder')} {...field} className='rounded-xl border-gray-200' />
									</FormControl>
								</FormItem>
							)}
						/>
						<div className='grid sm:grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='kvkNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.kvkNumber')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.kvkPlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='phone'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.phone')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.phonePlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name='website'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-sm text-gray-600'>{t('settings.website')}</FormLabel>
									<FormControl>
										<Input placeholder={t('settings.websitePlaceholder')} {...field} className='rounded-xl border-gray-200' />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					{/* Bank details */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
						<h2 className='font-bold text-gray-900 flex items-center gap-2'>
							<CreditCard className='w-4 h-4 text-gray-400' /> {t('settings.bankDetails')}
							<span className='text-xs font-normal text-gray-400'>{t('settings.bankDetailsHint')}</span>
						</h2>
						<div className='grid sm:grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='iban'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.iban')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.ibanPlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='bic'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('settings.bic')}</FormLabel>
										<FormControl>
											<Input placeholder={t('settings.bicPlaceholder')} {...field} className='rounded-xl border-gray-200' />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className='flex justify-end'>
						<Button
							type='submit'
							disabled={saving}
							className='px-6 py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
						>
							{saving ? t('settings.saving') : t('settings.save')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
