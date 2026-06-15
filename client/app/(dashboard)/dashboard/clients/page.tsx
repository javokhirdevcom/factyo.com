'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getClientsAction, createClientAction, updateClientAction, deleteClientAction } from '@/actions/client.action'
import { IClient } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { clientSchema } from '@/lib/validation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Users, Plus, Trash2, X, Mail, Building2, Check, Pencil } from 'lucide-react'

type FormValues = z.infer<typeof clientSchema>

interface EditState {
	clientId: string
	field: keyof IClient
	value: string
}

// Defined outside the page component so React never unmounts/remounts it on re-render
interface EditableFieldProps {
	client: IClient
	field: keyof IClient
	placeholder?: string
	editing: EditState | null
	setEditing: (v: EditState | null) => void
	commitEdit: () => void
	savingEdit: boolean
}

function EditableField({ client, field, placeholder, editing, setEditing, commitEdit, savingEdit }: EditableFieldProps) {
	const isActive = editing?.clientId === client._id && editing?.field === field
	const val = String((client as any)[field] ?? '')

	if (isActive) {
		return (
			<span className='inline-flex items-center gap-1'>
				<input
					autoFocus
					value={editing!.value}
					onChange={e => setEditing({ ...editing!, value: e.target.value })}
					onKeyDown={e => {
						if (e.key === 'Enter') commitEdit()
						if (e.key === 'Escape') setEditing(null)
					}}
					className='px-1.5 py-0.5 rounded border border-pink-400 text-xs outline-none w-40 bg-white'
				/>
				<button
					onClick={commitEdit}
					disabled={savingEdit}
					className='p-0.5 rounded hover:bg-green-50 text-green-600'
				>
					<Check className='w-3 h-3' />
				</button>
				<button
					onClick={() => setEditing(null)}
					className='p-0.5 rounded hover:bg-gray-100 text-gray-400'
				>
					<X className='w-3 h-3' />
				</button>
			</span>
		)
	}

	return (
		<span
			className='cursor-pointer hover:bg-gray-100 rounded px-0.5 group'
			onDoubleClick={() => setEditing({ clientId: client._id, field, value: val })}
			title='Double-click to edit'
		>
			{val || <span className='text-gray-300 italic text-xs'>{placeholder ?? '—'}</span>}
			<Pencil className='w-2.5 h-2.5 inline ml-1 opacity-0 group-hover:opacity-40 text-gray-400' />
		</span>
	)
}

export default function ClientsPage() {
	const { t } = useLanguage()
	const { data: session, status } = useSession()
	const [clients, setClients] = useState<IClient[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [saving, setSaving] = useState(false)
	const [confirmId, setConfirmId] = useState<string | null>(null)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [editing, setEditing] = useState<EditState | null>(null)
	const [savingEdit, setSavingEdit] = useState(false)

	const user = (session as any)?.currentUser
	const userId: string | undefined = user?._id ?? session?.user?.id

	const form = useForm<FormValues, unknown, FormValues>({
		resolver: zodResolver(clientSchema) as any,
		defaultValues: { name: '', email: '', isCompany: false, company: '', kvk: '', btw: '', address: '' },
	})

	const watchIsCompany = form.watch('isCompany')

	const load = async () => {
		if (!userId) { setLoading(false); return }
		setLoading(true)
		const res = await getClientsAction({ userId })
		if (res?.data?.clients) setClients(res.data.clients)
		setLoading(false)
	}

	useEffect(() => {
		if (status === 'loading') return
		load()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, status])

	async function onSubmit(values: FormValues) {
		if (!userId) return
		setSaving(true)
		const res = await createClientAction({ userId, ...values })
		if (res?.data?.client) {
			toast.success(t('clients.added'))
			setClients(prev => [res.data!.client!, ...prev])
			form.reset({ name: '', email: '', isCompany: false, company: '', kvk: '', btw: '', address: '' })
			setShowForm(false)
		} else {
			toast.error(res?.data?.failure || t('common.error'))
		}
		setSaving(false)
	}

	const handleDelete = async (id: string) => {
		if (!userId) return
		setDeleting(id)
		const res = await deleteClientAction({ userId, clientId: id })
		if (res?.data?.success) {
			toast.success(t('clients.removed'))
			setClients(prev => prev.filter(c => c._id !== id))
		} else {
			toast.error(t('common.error'))
		}
		setDeleting(null)
		setConfirmId(null)
	}

	const commitEdit = async () => {
		if (!editing) return
		setSavingEdit(true)
		const client = clients.find(c => c._id === editing.clientId)
		if (!client) { setSavingEdit(false); setEditing(null); return }

		const updated = { ...client, [editing.field]: editing.value }
		const res = await updateClientAction({
			userId: userId!,
			clientId: client._id,
			name: updated.name,
			email: updated.email,
			isCompany: !!updated.isCompany,
			company: updated.company ?? '',
			kvk: updated.kvk ?? '',
			btw: updated.btw ?? '',
			address: updated.address ?? '',
		})
		if (res?.data?.client) {
			setClients(prev => prev.map(c => c._id === editing.clientId ? res.data!.client! : c))
			toast.success(t('clients.updated'))
		} else {
			toast.error(t('common.error'))
		}
		setSavingEdit(false)
		setEditing(null)
	}

	const editProps = { editing, setEditing, commitEdit, savingEdit }

	return (
		<div className='max-w-4xl mx-auto space-y-6'>
			{/* Delete confirm modal */}
			{confirmId && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4'>
						<h3 className='font-bold text-gray-900'>{t('clients.remove')}</h3>
						<p className='text-sm text-gray-500'>{t('clients.confirmRemove')}</p>
						<div className='flex gap-3'>
							<button onClick={() => setConfirmId(null)} className='flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50'>
								{t('common.cancel')}
							</button>
							<button onClick={() => handleDelete(confirmId)} disabled={!!deleting} className='flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60'>
								{deleting ? t('common.loading') : t('common.remove')}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-extrabold text-gray-900'>{t('clients.title')}</h1>
					<p className='text-gray-500 text-sm mt-0.5'>
						{clients.length} {clients.length !== 1 ? t('clients.countPlural') : t('clients.count')}
					</p>
				</div>
				<button
					onClick={() => setShowForm(v => !v)}
					className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'
				>
					{showForm ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
					{showForm ? t('clients.cancel') : t('clients.add')}
				</button>
			</div>

			{/* Add client form */}
			{showForm && (
				<div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
					<h2 className='font-bold text-gray-900 mb-4'>{t('clients.newClient')}</h2>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							{/* Company toggle */}
							<div className='flex items-center gap-4'>
								<span className='text-sm text-gray-600 font-medium'>Type:</span>
								<div className='flex gap-2'>
									<button
										type='button'
										onClick={() => form.setValue('isCompany', false)}
										className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${!watchIsCompany ? 'text-white border-transparent factyo-gradient' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
									>
										{t('clients.private')}
									</button>
									<button
										type='button'
										onClick={() => form.setValue('isCompany', true)}
										className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${watchIsCompany ? 'text-white border-transparent factyo-gradient' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
									>
										{t('clients.company')}
									</button>
								</div>
							</div>

							<div className='grid sm:grid-cols-2 gap-4'>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-gray-600'>{t('clients.name')} *</FormLabel>
											<FormControl>
												<Input placeholder={t('clients.namePlaceholder')} {...field} className='rounded-xl border-gray-200' />
											</FormControl>
											<FormMessage className='text-xs text-red-500' />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-gray-600'>{t('clients.email')} *</FormLabel>
											<FormControl>
												<Input type='email' placeholder={t('clients.emailPlaceholder')} {...field} className='rounded-xl border-gray-200' />
											</FormControl>
											<FormMessage className='text-xs text-red-500' />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='address'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-sm text-gray-600'>{t('clients.address')}</FormLabel>
											<FormControl>
												<Input placeholder={t('clients.addressPlaceholder')} {...field} className='rounded-xl border-gray-200' />
											</FormControl>
										</FormItem>
									)}
								/>
								{watchIsCompany && (
									<>
										<FormField
											control={form.control}
											name='company'
											render={({ field }) => (
												<FormItem>
													<FormLabel className='text-sm text-gray-600'>{t('clients.companyName')}</FormLabel>
													<FormControl>
														<Input placeholder={t('clients.companyPlaceholder')} {...field} className='rounded-xl border-gray-200' />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='kvk'
											render={({ field }) => (
												<FormItem>
													<FormLabel className='text-sm text-gray-600'>KvK-nummer</FormLabel>
													<FormControl>
														<Input placeholder='12345678' {...field} className='rounded-xl border-gray-200' />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='btw'
											render={({ field }) => (
												<FormItem>
													<FormLabel className='text-sm text-gray-600'>BTW-nummer</FormLabel>
													<FormControl>
														<Input placeholder='NL123456789B01' {...field} className='rounded-xl border-gray-200' />
													</FormControl>
												</FormItem>
											)}
										/>
									</>
								)}
							</div>
							<div className='flex gap-3 justify-end pt-2'>
								<button type='button' onClick={() => setShowForm(false)} className='px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'>
									{t('clients.cancel')}
								</button>
								<Button type='submit' disabled={saving} className='px-5 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'>
									{saving ? t('clients.saving') : t('clients.save')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			)}

			{/* Hint */}
			{clients.length > 0 && (
				<p className='text-xs text-gray-400 text-right'>
					Double-click any field to edit
				</p>
			)}

			{/* Client list */}
			<div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
				{loading ? (
					<div className='p-10 text-center'>
						<div className='w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin mx-auto' />
					</div>
				) : clients.length === 0 ? (
					<div className='p-16 flex flex-col items-center gap-3 text-center'>
						<div className='w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center'>
							<Users className='w-7 h-7 text-gray-400' />
						</div>
						<p className='font-bold text-gray-800 text-lg'>{t('clients.noClients')}</p>
						<p className='text-sm text-gray-400 max-w-xs'>{t('clients.noClientsDesc')}</p>
						<button onClick={() => setShowForm(true)} className='mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity'>
							<Plus className='w-4 h-4 inline mr-1' />{t('clients.addFirst')}
						</button>
					</div>
				) : (
					<div className='divide-y divide-gray-50'>
						{clients.map(client => (
							<div key={client._id} className='px-6 py-4 hover:bg-gray-50 transition-colors'>
								<div className='flex items-start gap-4'>
									<div className='w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 factyo-gradient mt-0.5'>
										{client.name.charAt(0).toUpperCase()}
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2 flex-wrap'>
											<p className='font-semibold text-gray-900 text-sm'>
												<EditableField client={client} field='name' {...editProps} />
											</p>
											{client.isCompany && (
												<span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600'>Bedrijf</span>
											)}
										</div>
										<div className='flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400'>
											<span className='flex items-center gap-1'>
												<Mail className='w-3 h-3' />
												<EditableField client={client} field='email' {...editProps} />
											</span>
											{(client.isCompany || client.company) && (
												<span className='flex items-center gap-1'>
													<Building2 className='w-3 h-3' />
													<EditableField client={client} field='company' placeholder='Bedrijfsnaam' {...editProps} />
												</span>
											)}
										</div>
										{client.isCompany && (
											<div className='flex items-center gap-4 mt-1 text-xs text-gray-400'>
												<span>KvK: <EditableField client={client} field='kvk' placeholder='—' {...editProps} /></span>
												<span>BTW: <EditableField client={client} field='btw' placeholder='—' {...editProps} /></span>
											</div>
										)}
										{client.address && (
											<div className='mt-0.5 text-xs text-gray-400'>
												<EditableField client={client} field='address' {...editProps} />
											</div>
										)}
									</div>
									<button
										onClick={() => setConfirmId(client._id)}
										disabled={deleting === client._id}
										className='p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0'
									>
										<Trash2 className='w-4 h-4' />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
