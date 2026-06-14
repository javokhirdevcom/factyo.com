'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { getClientsAction } from '@/actions/client.action'
import { getInvoiceAction, updateInvoiceAction } from '@/actions/invoice.action'
import { invoiceSchema } from '@/lib/validation'
import { IClient } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronLeft, UserPlus, ChevronDown } from 'lucide-react'

type FormValues = z.infer<typeof invoiceSchema>

const fmt = (n: number) =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export default function EditInvoicePage() {
	const { t } = useLanguage()
	const { data: session } = useSession()
	const { id } = useParams<{ id: string }>()
	const router = useRouter()
	const [clients, setClients] = useState<IClient[]>([])
	const [loading, setLoading] = useState(false)
	const [fetchingInvoice, setFetchingInvoice] = useState(true)
	const [clientSearch, setClientSearch] = useState('')
	const [showClientDropdown, setShowClientDropdown] = useState(false)
	const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
	const clientDropdownRef = useRef<HTMLDivElement>(null)

	const user = (session as any)?.currentUser

	const form = useForm<FormValues, unknown, FormValues>({
		resolver: zodResolver(invoiceSchema) as any,
		defaultValues: {
			clientId: '',
			invoiceNumber: '',
			date: '',
			dueDate: '',
			items: [{ description: '', hours: 0, hourlyRate: 0, total: 0 }],
			vatRate: 21,
			notes: '',
		},
	})

	const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
	const watchItems = form.watch('items')
	const watchVat = form.watch('vatRate')

	const subtotal = watchItems.reduce((s, i) => s + (Number(i.hours) * Number(i.hourlyRate)), 0)
	const vatAmount = subtotal * (Number(watchVat) / 100)
	const total = subtotal + vatAmount

	useEffect(() => {
		watchItems.forEach((item, idx) => {
			const computed = Number(item.hours) * Number(item.hourlyRate)
			if (computed !== item.total) form.setValue(`items.${idx}.total`, computed)
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(watchItems)])

	useEffect(() => {
		const load = async () => {
			const userId = user?._id
			if (!userId) return

			const [clientsRes, invoiceRes] = await Promise.all([
				getClientsAction({ userId }),
				getInvoiceAction({ userId, invoiceId: id }),
			])

			const loadedClients: IClient[] = clientsRes?.data?.clients ?? []
			if (loadedClients.length) setClients(loadedClients)

			const inv = invoiceRes?.data?.invoice
			if (inv) {
				const clientId = typeof inv.clientId === 'object' ? inv.clientId._id : inv.clientId
				form.reset({
					clientId: clientId ?? '',
					invoiceNumber: inv.invoiceNumber,
					date: inv.date.split('T')[0],
					dueDate: inv.dueDate.split('T')[0],
					items: inv.items.map((item: any) => ({
						description: item.description,
						hours: item.hours,
						hourlyRate: item.hourlyRate,
						total: item.total,
					})),
					vatRate: inv.vatRate,
					notes: inv.notes ?? '',
				})
				// Restore selected client from loaded clients
				const found = loadedClients.find(c => c._id === clientId)
				if (found) setSelectedClient(found)
			}

			setFetchingInvoice(false)
		}
		if (user) load()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, id])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
				setShowClientDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const filteredClients = clients.filter(c => {
		const q = clientSearch.toLowerCase()
		return c.name.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q)
	})

	const selectClient = (c: IClient) => {
		setSelectedClient(c)
		setClientSearch('')
		setShowClientDropdown(false)
		form.setValue('clientId', c._id, { shouldValidate: true })
	}

	async function onSubmit(values: FormValues) {
		setLoading(true)
		const userId = user?._id
		const res = await updateInvoiceAction({ userId, invoiceId: id, ...values, subtotal, vatAmount, total })
		if (res?.data?.failure) {
			toast.error(res.data.failure)
			setLoading(false)
			return
		}
		if (res?.data?.invoice) {
			toast.success('Invoice updated!')
			router.push(`/dashboard/invoices/${id}`)
		}
		setLoading(false)
	}

	if (fetchingInvoice) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-7 h-7 rounded-full border-2 border-pink-500 border-t-transparent animate-spin' />
			</div>
		)
	}

	return (
		<div className='max-w-3xl mx-auto space-y-6'>
			<div className='flex items-center gap-3'>
				<Link href={`/dashboard/invoices/${id}`} className='p-2 rounded-xl hover:bg-gray-100 transition-colors'>
					<ChevronLeft className='w-5 h-5 text-gray-500' />
				</Link>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900'>{t('invoices.editInvoice')}</h1>
					<p className='text-gray-500 text-sm'>Update the invoice details below.</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					{/* Client + Invoice meta */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
						<h2 className='font-bold text-gray-900'>{t('invoices.details')}</h2>

						<FormField
							control={form.control}
							name='clientId'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-sm text-gray-600'>{t('invoices.client')}</FormLabel>
									<FormControl>
										<input type='hidden' {...field} />
									</FormControl>
									<div className='relative' ref={clientDropdownRef}>
										<div
											className='w-full h-10 px-3 rounded-xl border border-gray-200 text-sm flex items-center gap-2 cursor-pointer hover:border-pink-300 transition-colors'
											style={{ background: '#fff' }}
											onClick={() => setShowClientDropdown(v => !v)}
										>
											{selectedClient ? (
												<span className='flex-1 text-gray-800 truncate'>
													{selectedClient.name}{selectedClient.company ? ` — ${selectedClient.company}` : ''}
												</span>
											) : (
												<input
													type='text'
													placeholder={t('invoices.searchClient')}
													value={clientSearch}
													onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true) }}
													onClick={e => { e.stopPropagation(); setShowClientDropdown(true) }}
													className='flex-1 outline-none bg-transparent text-sm placeholder-gray-400'
												/>
											)}
											{selectedClient ? (
												<button
													type='button'
													onClick={e => { e.stopPropagation(); setSelectedClient(null); form.setValue('clientId', ''); setShowClientDropdown(true) }}
													className='text-gray-400 hover:text-gray-600 shrink-0'
												>
													×
												</button>
											) : (
												<ChevronDown className='w-4 h-4 text-gray-400 shrink-0' />
											)}
										</div>
										{showClientDropdown && (
											<div className='absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
												{!selectedClient && (
													<div className='px-3 py-2 border-b border-gray-100'>
														<input
															type='text'
															placeholder={t('invoices.searchClient')}
															value={clientSearch}
															onChange={e => setClientSearch(e.target.value)}
															className='w-full text-sm outline-none'
															autoFocus
														/>
													</div>
												)}
												<div className='max-h-48 overflow-y-auto'>
													{filteredClients.length === 0 ? (
														<p className='px-4 py-3 text-sm text-gray-400'>{t('invoices.noClientsYet')}</p>
													) : (
														filteredClients.map(c => (
															<button
																key={c._id}
																type='button'
																onClick={() => selectClient(c)}
																className='w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors'
															>
																<span className='font-medium text-gray-800'>{c.name}</span>
																{c.company && <span className='text-gray-400 ml-1.5'>— {c.company}</span>}
															</button>
														))
													)}
												</div>
												<Link
													href='/dashboard/clients'
													className='flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-t border-gray-100 hover:bg-gray-50 transition-colors'
													style={{ color: '#FF2D78' }}
												>
													<UserPlus className='w-3.5 h-3.5' /> {t('invoices.addNewClient')}
												</Link>
											</div>
										)}
									</div>
									<FormMessage className='text-xs text-red-500' />
								</FormItem>
							)}
						/>

						<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
							<FormField
								control={form.control}
								name='invoiceNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('invoices.invoiceNumber')}</FormLabel>
										<FormControl>
											<Input {...field} className='rounded-xl border-gray-200' />
										</FormControl>
										<FormMessage className='text-xs text-red-500' />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='date'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('invoices.date')}</FormLabel>
										<FormControl>
											<Input type='date' {...field} className='rounded-xl border-gray-200' />
										</FormControl>
										<FormMessage className='text-xs text-red-500' />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='dueDate'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm text-gray-600'>{t('invoices.dueDate')}</FormLabel>
										<FormControl>
											<Input type='date' {...field} className='rounded-xl border-gray-200' />
										</FormControl>
										<FormMessage className='text-xs text-red-500' />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Line items */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
						<h2 className='font-bold text-gray-900'>{t('invoices.lineItems')}</h2>

						<div className='hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1'>
							<span>{t('invoices.description')}</span>
							<span>{t('invoices.hours')}</span>
							<span>{t('invoices.rate')}</span>
							<span>{t('invoices.total')}</span>
							<span />
						</div>

						{fields.map((field, idx) => (
							<div key={field.id} className='grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-start'>
								<FormField
									control={form.control}
									name={`items.${idx}.description`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className='md:hidden text-xs text-gray-500'>{t('invoices.description')}</FormLabel>
											<FormControl>
												<Input placeholder='Service description' {...field} className='rounded-xl border-gray-200 text-sm' />
											</FormControl>
											<FormMessage className='text-xs text-red-500' />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`items.${idx}.hours`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className='md:hidden text-xs text-gray-500'>{t('invoices.hours')}</FormLabel>
											<FormControl>
												<Input type='number' min='0' step='0.5' placeholder='0' {...field} className='rounded-xl border-gray-200 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`items.${idx}.hourlyRate`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className='md:hidden text-xs text-gray-500'>{t('invoices.rate')}</FormLabel>
											<FormControl>
												<Input type='number' min='0' step='0.01' placeholder='0.00' {...field} className='rounded-xl border-gray-200 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<div className='flex items-center h-10 px-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700'>
									{fmt(Number(watchItems[idx]?.hours ?? 0) * Number(watchItems[idx]?.hourlyRate ?? 0))}
								</div>
								<button
									type='button'
									onClick={() => fields.length > 1 && remove(idx)}
									disabled={fields.length === 1}
									className='mt-0 md:mt-0 h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30'
								>
									<Trash2 className='w-4 h-4' />
								</button>
							</div>
						))}

						<button
							type='button'
							onClick={() => append({ description: '', hours: 0, hourlyRate: 0, total: 0 })}
							className='flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-pink-400 hover:text-pink-500 transition-colors'
						>
							<Plus className='w-4 h-4' /> {t('invoices.addItem')}
						</button>

						{/* Totals */}
						<div className='pt-4 border-t border-gray-100 space-y-2'>
							<div className='flex justify-between text-sm text-gray-500'>
								<span>{t('invoices.subtotal')}</span>
								<span className='font-medium text-gray-800'>{fmt(subtotal)}</span>
							</div>
							<div className='flex items-center justify-between text-sm text-gray-500'>
								<div className='flex items-center gap-2'>
									<span>{t('invoices.vatRate')}</span>
									<FormField
										control={form.control}
										name='vatRate'
										render={({ field }) => (
											<FormItem className='mb-0'>
												<FormControl>
													<select
														{...field}
														onChange={e => field.onChange(Number(e.target.value))}
														className='h-7 text-xs rounded-lg border border-gray-200 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-pink-400'
													>
														<option value='21'>{t('invoices.vatOption21')}</option>
														<option value='9'>{t('invoices.vatOption9')}</option>
														<option value='0'>{t('invoices.vatOption0')}</option>
													</select>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<span className='font-medium text-gray-800'>{fmt(vatAmount)}</span>
							</div>
							{watchVat === 0 && (
								<p className='text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5'>BTW-verlegd — VAT is reverse-charged to the recipient.</p>
							)}
							<div className='flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200'>
								<span>{t('invoices.total')}</span>
								<span style={{ color: '#FF2D78' }}>{fmt(total)}</span>
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3'>
						<h2 className='font-bold text-gray-900'>{t('invoices.notes')}</h2>
						<FormField
							control={form.control}
							name='notes'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											placeholder={t('invoices.notesPlaceholder')}
											{...field}
											className='rounded-xl border-gray-200 text-sm resize-none'
											rows={3}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<div className='flex gap-3 justify-end'>
						<Link
							href={`/dashboard/invoices/${id}`}
							className='px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'
						>
							{t('invoices.cancelForm')}
						</Link>
						<Button
							type='submit'
							disabled={loading}
							className='px-6 py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
						>
							{loading ? t('invoices.saving') : t('invoices.save')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
