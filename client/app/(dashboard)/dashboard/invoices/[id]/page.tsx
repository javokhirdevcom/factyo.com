'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
	getInvoiceAction,
	sendInvoiceAction,
	updateInvoiceStatusAction,
	deleteInvoiceAction,
	createInvoiceAction,
} from '@/actions/invoice.action'
import { IInvoice } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { toast } from 'sonner'
import { ChevronLeft, Send, CheckCircle, Download, Pencil, Trash2, Copy } from 'lucide-react'

const fmt = (n: number) =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

const fmtDate = (d: string) =>
	new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

const statusColor: Record<string, { bg: string; text: string }> = {
	draft: { bg: '#f3f4f6', text: '#6b7280' },
	sent: { bg: '#eff6ff', text: '#2563eb' },
	paid: { bg: '#f0fdf4', text: '#16a34a' },
}

export default function InvoiceDetailPage() {
	const { t } = useLanguage()
	const { data: session } = useSession()
	const { id } = useParams<{ id: string }>()
	const router = useRouter()
	const [invoice, setInvoice] = useState<IInvoice | null>(null)
	const [loading, setLoading] = useState(true)
	const [sending, setSending] = useState(false)
	const [markingPaid, setMarkingPaid] = useState(false)
	const [downloading, setDownloading] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [showSendPreview, setShowSendPreview] = useState(false)
	const [duplicating, setDuplicating] = useState(false)

	const user = (session as any)?.currentUser
	const userId: string | undefined = user?._id ?? session?.user?.id

	useEffect(() => {
		const load = async () => {
			if (!userId || !id) { setLoading(false); return }
			const res = await getInvoiceAction({ userId, invoiceId: id })
			if (res?.data?.invoice) setInvoice(res.data.invoice)
			setLoading(false)
		}
		load()
	}, [userId, id])

	const handleSendConfirmed = async () => {
		if (!invoice) return
		setSending(true)
		setShowSendPreview(false)
		const res = await sendInvoiceAction({ userId: userId!, invoiceId: invoice._id })
		if (res?.data?.success) {
			toast.success(t('invoices.sentSuccess'))
			setInvoice(prev => prev ? { ...prev, status: 'sent' } : prev)
		} else {
			toast.error(res?.data?.failure || t('common.error'))
		}
		setSending(false)
	}

	const handleMarkPaid = async () => {
		if (!invoice) return
		setMarkingPaid(true)
		const res = await updateInvoiceStatusAction({ userId: userId!, invoiceId: invoice._id, status: 'paid' })
		if (res?.data?.success) {
			toast.success(t('invoices.markedPaid'))
			setInvoice(prev => prev ? { ...prev, status: 'paid' } : prev)
		} else {
			toast.error(t('common.error'))
		}
		setMarkingPaid(false)
	}

	const handleDelete = async () => {
		if (!invoice) return
		setDeleting(true)
		try {
			const res = await deleteInvoiceAction({ userId: userId!, invoiceId: invoice._id })
			if (res?.data?.success) {
				toast.success(t('invoices.deleted'))
				router.push('/dashboard/invoices')
			} else {
				toast.error(t('common.error'))
				setDeleting(false)
				setConfirmDelete(false)
			}
		} catch {
			toast.error(t('common.error'))
			setDeleting(false)
			setConfirmDelete(false)
		}
	}

	const handleDuplicate = async () => {
		if (!invoice) return
		setDuplicating(true)
		try {
			const today = new Date().toISOString().split('T')[0]
			const due = new Date(Date.now() + 14 * 86400_000).toISOString().split('T')[0]
			const year = new Date().getFullYear()
			const clientId = typeof invoice.clientId === 'object' ? invoice.clientId._id : invoice.clientId as string
			const newNumber = `${year}-${String(((user?.invoiceSequence ?? 0) + 1)).padStart(4, '0')}`

			const res = await createInvoiceAction({
				userId: userId!,
				clientId,
				invoiceNumber: newNumber,
				date: today,
				dueDate: due,
				items: invoice.items,
				vatRate: invoice.vatRate,
				notes: invoice.notes || '',
				subtotal: invoice.subtotal,
				vatAmount: invoice.vatAmount,
				total: invoice.total,
			})

			if (res?.data?.invoice) {
				toast.success('Invoice duplicated!')
				router.push(`/dashboard/invoices/${res.data.invoice._id}/edit`)
			} else {
				toast.error(res?.data?.failure || t('common.error'))
			}
		} catch {
			toast.error(t('common.error'))
		} finally {
			setDuplicating(false)
		}
	}

	const handleDownloadPdf = async () => {
		if (!invoice) return
		setDownloading(true)
		try {
			const jsPDF = (await import('jspdf')).default
			const client = typeof invoice.clientId === 'object' ? invoice.clientId : null

			const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
			const PW = 210
			const MARGIN = 15
			const CW = PW - MARGIN * 2
			const DARK: [number, number, number] = [17, 24, 39]
			const GRAY: [number, number, number] = [107, 114, 128]
			const LIGHT: [number, number, number] = [243, 244, 246]

			let y = MARGIN

			// ── Header: Logo (left) + Company info (right) ────────────
			const headerStartY = y
			let logoH = 0

			if (user?.logoUrl) {
				try {
					const imgRes = await fetch(user.logoUrl)
					const imgBlob = await imgRes.blob()
					const dataUrl = await new Promise<string>(resolve => {
						const reader = new FileReader()
						reader.onload = () => resolve(reader.result as string)
						reader.readAsDataURL(imgBlob)
					})
					const img = new window.Image()
					img.src = dataUrl
					await new Promise(resolve => { img.onload = resolve })
					const aspectRatio = img.naturalWidth / img.naturalHeight
					logoH = 12
					const logoW = Math.min(aspectRatio * logoH, 40)
					const fmt2 = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
					doc.addImage(dataUrl, fmt2, MARGIN, y, logoW, logoH)
				} catch {
					doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...DARK)
					doc.text(user?.businessName || user?.fullName || '', MARGIN, y + 6)
					logoH = 8
				}
			} else {
				doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...DARK)
				doc.text(user?.businessName || user?.fullName || '', MARGIN, y + 6)
				logoH = 8
			}

			// Company info right
			let ry = headerStartY
			doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...DARK)
			doc.text(user?.businessName || user?.fullName || '', PW - MARGIN, ry + 3, { align: 'right' })
			ry += 6
			doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRAY)
			if (user?.businessAddress) { doc.text(user.businessAddress, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }
			if (user?.email) { doc.text(user.email, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }
			if (user?.vatNumber) { doc.text(`VAT: ${user.vatNumber}`, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }
			if (user?.kvkNumber) { doc.text(`CoC: ${user.kvkNumber}`, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }
			if (user?.phone) { doc.text(user.phone, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }
			if (user?.iban) { doc.text(`IBAN: ${user.iban}`, PW - MARGIN, ry + 3, { align: 'right' }); ry += 5 }

			y = Math.max(headerStartY + logoH + 4, ry + 3) + 6

			// ── Separator ─────────────────────────────────────────────
			doc.setDrawColor(229, 231, 235).setLineWidth(0.2).line(MARGIN, y, PW - MARGIN, y)
			y += 7

			// ── Client block (left) + Invoice meta (right) ────────────
			const sectionY = y

			// Client
			doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...GRAY)
			doc.text('Invoice to:', MARGIN, y)
			y += 4
			doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...DARK)
			doc.text(client?.name ?? '—', MARGIN, y)
			y += 5
			doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY)
			if (client?.company) { doc.text(client.company, MARGIN, y); y += 4.5 }
			if (client?.address) { doc.text(client.address, MARGIN, y); y += 4.5 }
			if ((client as any)?.btw) { doc.text(`VAT: ${(client as any).btw}`, MARGIN, y); y += 4.5 }
			if (client?.email) { doc.text(client.email, MARGIN, y); y += 4.5 }

			// Invoice meta (right)
			let my = sectionY
			const rightX = PW / 2 + 4
			doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...DARK)
			doc.text(`Invoice ${invoice.invoiceNumber}`, PW - MARGIN, my, { align: 'right' })
			my += 7
			if (user?.vatNumber) {
				doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRAY)
				doc.text(`VAT number: ${user.vatNumber}`, PW - MARGIN, my, { align: 'right' })
				my += 5
			}
			my += 2
			doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY)
			doc.text('Invoice date:', rightX, my)
			doc.setFont('helvetica', 'bold').setTextColor(...DARK)
			doc.text(fmtDate(invoice.date), PW - MARGIN, my, { align: 'right' })
			my += 5
			doc.setFont('helvetica', 'normal').setTextColor(...GRAY)
			doc.text('Due date:', rightX, my)
			doc.setFont('helvetica', 'bold').setTextColor(...DARK)
			doc.text(fmtDate(invoice.dueDate), PW - MARGIN, my, { align: 'right' })

			y = Math.max(y, my + 6) + 6

			// ── Separator ─────────────────────────────────────────────
			doc.setDrawColor(229, 231, 235).setLineWidth(0.2).line(MARGIN, y, PW - MARGIN, y)
			y += 5

			// ── Table ─────────────────────────────────────────────────
			doc.setFillColor(...LIGHT)
			doc.rect(MARGIN, y, CW, 7, 'F')
			doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...GRAY)
			doc.text('DESCRIPTION', MARGIN + 3, y + 5)
			doc.text('QTY', MARGIN + CW * 0.61, y + 5)
			doc.text('AMOUNT', MARGIN + CW * 0.73, y + 5)
			doc.text('TOTAL', PW - MARGIN - 2, y + 5, { align: 'right' })
			y += 10

			for (const item of invoice.items) {
				doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...DARK)
				doc.text(item.description, MARGIN + 3, y, { maxWidth: CW * 0.55 })
				doc.setTextColor(...GRAY)
				doc.text(String(item.hours), MARGIN + CW * 0.61, y)
				doc.text(fmt(item.hourlyRate), MARGIN + CW * 0.73, y)
				doc.setFont('helvetica', 'bold').setTextColor(...DARK)
				doc.text(fmt(item.total), PW - MARGIN - 2, y, { align: 'right' })
				y += 5
				doc.setDrawColor(243, 244, 246).setLineWidth(0.2).line(MARGIN, y, PW - MARGIN, y)
				y += 4
			}
			y += 4

			// ── Totals ─────────────────────────────────────────────────
			const totX = PW - MARGIN - 50
			doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...GRAY)
			doc.text('Subtotal', totX, y)
			doc.text(fmt(invoice.subtotal), PW - MARGIN - 2, y, { align: 'right' })
			y += 6
			doc.text(`VAT (${invoice.vatRate}%)`, totX, y)
			doc.text(fmt(invoice.vatAmount), PW - MARGIN - 2, y, { align: 'right' })
			y += 4
			doc.setDrawColor(229, 231, 235).setLineWidth(0.4).line(totX, y, PW - MARGIN, y)
			y += 6
			doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...DARK)
			doc.text('Total', totX, y)
			doc.text(fmt(invoice.total), PW - MARGIN - 2, y, { align: 'right' })
			y += 8

			// ── VAT reverse charge ──────────────────────────────────────
			if (invoice.vatRate === 0) {
				doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(37, 99, 235)
				doc.text('VAT reverse-charged', MARGIN, y)
				y += 7
			}

			// ── Notes ──────────────────────────────────────────────────
			if (invoice.notes) {
				doc.setFillColor(249, 250, 251)
				doc.rect(MARGIN, y, CW, 12, 'F')
				doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...DARK)
				doc.text('Note: ', MARGIN + 3, y + 7)
				doc.setFont('helvetica', 'normal').setTextColor(...GRAY)
				doc.text(invoice.notes, MARGIN + 16, y + 7, { maxWidth: CW - 18 })
				y += 16
			}

			// ── Footer ─────────────────────────────────────────────────
			doc.setDrawColor(229, 231, 235).setLineWidth(0.3).line(MARGIN, 283, PW - MARGIN, 283)
			doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY)
			doc.text(
				`We kindly ask you to pay ${fmt(invoice.total)} before ${fmtDate(invoice.dueDate)}, citing payment reference ${invoice.invoiceNumber}.`,
				PW / 2, 289, { align: 'center', maxWidth: CW }
			)

			doc.save(`Invoice-${invoice.invoiceNumber}.pdf`)
		} catch (e) {
			console.error(e)
			toast.error(t('common.error'))
		} finally {
			setDownloading(false)
		}
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-7 h-7 rounded-full border-2 border-pink-500 border-t-transparent animate-spin' />
			</div>
		)
	}

	if (!invoice) {
		return (
			<div className='text-center py-20'>
				<p className='text-gray-500'>{t('invoices.notFound')}</p>
				<Link href='/dashboard/invoices' className='mt-4 inline-block text-sm font-semibold underline' style={{ color: '#FF2D78' }}>
					{t('invoices.backToInvoices')}
				</Link>
			</div>
		)
	}

	const client = typeof invoice.clientId === 'object' ? invoice.clientId : null
	const sc = statusColor[invoice.status]
	const statusLabel = t(`invoices.status${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`)

	return (
		<div className='max-w-3xl mx-auto space-y-6'>
			{/* Delete confirm modal */}
			{confirmDelete && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4'>
						<h3 className='font-bold text-gray-900'>{t('invoices.deleteInvoice')}</h3>
						<p className='text-sm text-gray-500'>{t('invoices.confirmDelete')}</p>
						<div className='flex gap-3'>
							<button onClick={() => setConfirmDelete(false)} className='flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'>
								{t('common.cancel')}
							</button>
							<button onClick={handleDelete} disabled={deleting} className='flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60'>
								{deleting ? t('common.loading') : t('common.delete')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Send preview modal */}
			{showSendPreview && invoice && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
					<div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
						<div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
							<h3 className='font-bold text-gray-900'>{t('invoices.previewTitle')}</h3>
							<button onClick={() => setShowSendPreview(false)} className='text-gray-400 hover:text-gray-600 text-xl font-light'>×</button>
						</div>
						<div className='flex-1 overflow-y-auto p-4'>
							{/* Clean white preview */}
							<div className='bg-white border border-gray-100 rounded' style={{ fontSize: '85%' }}>
								{/* Header */}
								<div className='px-7 pt-5 pb-4 flex justify-between items-start'>
									<div>
										{user?.logoUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={user.logoUrl} alt='logo' className='h-9 object-contain max-w-35' />
										) : (
											<p className='font-extrabold text-lg text-gray-900'>{user?.businessName || user?.fullName}</p>
										)}
									</div>
									<div className='text-right space-y-0.5'>
										<p className='font-bold text-xs text-gray-900'>{user?.businessName || user?.fullName}</p>
										{user?.businessAddress && <p className='text-[10px] text-gray-500'>{user.businessAddress}</p>}
										<p className='text-[10px] text-gray-500'>{user?.email}</p>
										{user?.vatNumber && <p className='text-[10px] text-gray-400'>VAT: {user.vatNumber}</p>}
										{user?.kvkNumber && <p className='text-[10px] text-gray-400'>CoC: {user.kvkNumber}</p>}
										{user?.phone && <p className='text-[10px] text-gray-400'>{user.phone}</p>}
										{user?.iban && <p className='text-[10px] text-gray-400'>IBAN: {user.iban}</p>}
									</div>
								</div>
								<div className='mx-7 border-t border-gray-100' />
								{/* Client + meta */}
								<div className='px-7 py-4 grid grid-cols-2 gap-6'>
									<div>
										<p className='text-[9px] text-gray-400 mb-1.5'>Invoice to:</p>
										<p className='font-bold text-gray-900 text-xs'>{client?.name}</p>
										{client?.company && <p className='text-[10px] text-gray-500 mt-0.5'>{client.company}</p>}
										{client?.address && <p className='text-[10px] text-gray-500 mt-0.5'>{client.address}</p>}
										{client?.email && <p className='text-[10px] text-gray-500 mt-0.5'>{client.email}</p>}
									</div>
									<div className='text-right'>
										<p className='font-extrabold text-gray-900 text-sm'>Invoice {invoice.invoiceNumber}</p>
										{user?.vatNumber && <p className='text-[9px] text-gray-400 mt-0.5'>VAT number: {user.vatNumber}</p>}
										<div className='mt-2 space-y-1'>
											<div className='flex justify-between text-[10px]'>
												<span className='text-gray-400'>Invoice date:</span>
												<span className='font-semibold text-gray-700'>{fmtDate(invoice.date)}</span>
											</div>
											<div className='flex justify-between text-[10px]'>
												<span className='text-gray-400'>Due date:</span>
												<span className='font-semibold text-gray-700'>{fmtDate(invoice.dueDate)}</span>
											</div>
										</div>
									</div>
								</div>
								<div className='mx-7 border-t border-gray-100' />
								<div className='px-7 py-4 space-y-4'>
									{/* Table */}
									<div>
										<div className='grid grid-cols-[1fr_48px_72px_72px] gap-2 bg-gray-50 px-2 py-2 rounded-t'>
											<span className='text-[8px] font-bold uppercase tracking-widest text-gray-400'>Description</span>
											<span className='text-[8px] font-bold uppercase tracking-widest text-gray-400 text-center'>Qty</span>
											<span className='text-[8px] font-bold uppercase tracking-widest text-gray-400 text-right'>Amount</span>
											<span className='text-[8px] font-bold uppercase tracking-widest text-gray-400 text-right'>Total</span>
										</div>
										{invoice.items.map((item, i) => (
											<div key={i} className='grid grid-cols-[1fr_48px_72px_72px] gap-2 py-2 border-b border-gray-50 px-2'>
												<span className='text-[10px] text-gray-800'>{item.description}</span>
												<span className='text-[10px] text-gray-500 text-center'>{item.hours}</span>
												<span className='text-[10px] text-gray-500 text-right'>{fmt(item.hourlyRate)}</span>
												<span className='text-[10px] font-semibold text-gray-900 text-right'>{fmt(item.total)}</span>
											</div>
										))}
									</div>
									{/* Totals */}
									<div className='flex justify-end'>
										<div className='w-44 space-y-1'>
											<div className='flex justify-between text-[10px] text-gray-500'><span>Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
											<div className='flex justify-between text-[10px] text-gray-500'><span>VAT ({invoice.vatRate}%)</span><span>{fmt(invoice.vatAmount)}</span></div>
											<div className='flex justify-between text-xs font-extrabold text-gray-900 pt-1.5 border-t border-gray-200'>
												<span>Total</span><span>{fmt(invoice.total)}</span>
											</div>
											{invoice.vatRate === 0 && <p className='text-[9px] text-blue-600'>VAT reverse-charged</p>}
										</div>
									</div>
									{invoice.notes && (
										<div className='rounded bg-gray-50 px-3 py-2 text-[10px] text-gray-600'>
											<span className='font-semibold'>Note: </span>{invoice.notes}
										</div>
									)}
								</div>
								{/* Footer */}
								<div className='mx-7 border-t border-gray-100 py-3 text-center'>
									<p className='text-[9px] text-gray-400'>
										We kindly ask you to pay {fmt(invoice.total)} before {fmtDate(invoice.dueDate)}, citing payment reference {invoice.invoiceNumber}.
									</p>
								</div>
							</div>
						</div>
						<div className='px-6 py-4 border-t border-gray-100 flex gap-3 justify-end'>
							<button
								onClick={() => setShowSendPreview(false)}
								className='px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'
							>
								{t('common.cancel')}
							</button>
							<button
								onClick={handleSendConfirmed}
								disabled={sending}
								className='flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity disabled:opacity-60'
							>
								<Send className='w-4 h-4' />
								{sending ? t('invoices.sending') : t('invoices.previewSend')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Top bar */}
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<div className='flex items-center gap-3'>
					<Link href='/dashboard/invoices' className='p-2 rounded-xl hover:bg-gray-100 transition-colors'>
						<ChevronLeft className='w-5 h-5 text-gray-500' />
					</Link>
					<div>
						<div className='flex items-center gap-2'>
							<h1 className='text-2xl font-extrabold text-gray-900'>{invoice.invoiceNumber}</h1>
							<span className='text-xs font-bold px-2 py-0.5 rounded-full' style={{ background: sc.bg, color: sc.text }}>
								{statusLabel}
							</span>
						</div>
						<p className='text-gray-400 text-sm'>{t('invoices.createdOn')} {fmtDate(invoice.createdAt ?? invoice.date)}</p>
					</div>
				</div>

				<div className='flex items-center gap-2 flex-wrap'>
					<button
						onClick={handleDownloadPdf}
						disabled={downloading}
						className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
					>
						<Download className='w-4 h-4' />
						{downloading ? t('invoices.downloading') : t('invoices.download')}
					</button>

					<button
						onClick={handleDuplicate}
						disabled={duplicating}
						className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
					>
						<Copy className='w-4 h-4' />
						{duplicating ? '…' : 'Duplicate'}
					</button>

					{invoice.status === 'draft' && (
						<Link
							href={`/dashboard/invoices/${invoice._id}/edit`}
							className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors'
						>
							<Pencil className='w-4 h-4' />
							{t('invoices.editInvoice')}
						</Link>
					)}

					<button
						onClick={() => setConfirmDelete(true)}
						className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors'
					>
						<Trash2 className='w-4 h-4' />
					</button>

					{invoice.status !== 'paid' && (
						<button
							onClick={handleMarkPaid}
							disabled={markingPaid}
							className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-200 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors disabled:opacity-60'
						>
							<CheckCircle className='w-4 h-4' />
							{markingPaid ? t('invoices.updating') : t('invoices.markPaid')}
						</button>
					)}

					{invoice.status !== 'paid' && (
						<button
							onClick={() => setShowSendPreview(true)}
							disabled={sending}
							className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white factyo-gradient hover:opacity-90 transition-opacity disabled:opacity-60'
						>
							<Send className='w-4 h-4' />
							{sending ? t('invoices.sending') : invoice.status === 'sent' ? t('invoices.resend') : t('invoices.send')}
						</button>
					)}
				</div>
			</div>

			{/* Paper invoice — clean white design */}
			<div className='flex justify-center'>
				<div
					id='invoice-preview'
					className='w-full bg-white overflow-hidden'
					style={{
						maxWidth: '794px',
						boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px rgba(0,0,0,0.1)',
						borderRadius: '2px',
					}}
				>
					{/* Header */}
					<div className='px-10 pt-8 pb-6 flex justify-between items-start'>
						<div>
							{user?.logoUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={user.logoUrl} alt='logo' className='h-14 object-contain max-w-45' />
							) : (
								<p className='font-extrabold text-2xl text-gray-900'>{user?.businessName || user?.fullName}</p>
							)}
						</div>
						<div className='text-right space-y-0.5'>
							<p className='font-bold text-sm text-gray-900'>{user?.businessName || user?.fullName}</p>
							{user?.businessAddress && <p className='text-xs text-gray-500'>{user.businessAddress}</p>}
							<p className='text-xs text-gray-500'>{user?.email}</p>
							{user?.vatNumber && <p className='text-xs text-gray-400'>VAT: {user.vatNumber}</p>}
							{user?.kvkNumber && <p className='text-xs text-gray-400'>CoC: {user.kvkNumber}</p>}
							{user?.phone && <p className='text-xs text-gray-400'>{user.phone}</p>}
							{user?.iban && <p className='text-xs text-gray-400'>IBAN: {user.iban}</p>}
						</div>
					</div>

					<div className='mx-10 border-t border-gray-100' />

					{/* Client + Invoice meta */}
					<div className='px-10 py-7 grid grid-cols-2 gap-10'>
						<div>
							<p className='text-xs text-gray-400 mb-2'>Invoice to:</p>
							<p className='font-bold text-gray-900'>{client?.name ?? '—'}</p>
							{client?.company && <p className='text-sm text-gray-500 mt-0.5'>{client.company}</p>}
							{(client as any)?.btw && <p className='text-xs text-gray-400'>VAT: {(client as any).btw}</p>}
							{(client as any)?.kvk && <p className='text-xs text-gray-400'>CoC: {(client as any).kvk}</p>}
							{client?.address && <p className='text-sm text-gray-500 mt-0.5'>{client.address}</p>}
							{client?.email && <p className='text-sm text-gray-500 mt-0.5'>{client.email}</p>}
						</div>
						<div className='text-right'>
							<p className='text-xl font-extrabold text-gray-900'>Invoice {invoice.invoiceNumber}</p>
							{user?.vatNumber && <p className='text-xs text-gray-400 mt-1'>VAT number: {user.vatNumber}</p>}
							<div className='mt-3 space-y-1.5'>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>Invoice date:</span>
									<span className='font-semibold text-gray-700'>{fmtDate(invoice.date)}</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-400'>Due date:</span>
									<span className='font-semibold text-gray-700'>{fmtDate(invoice.dueDate)}</span>
								</div>
							</div>
						</div>
					</div>

					<div className='mx-10 border-t border-gray-100' />

					<div className='px-10 py-7 space-y-7'>
						{/* Table */}
						<div>
							<div className='grid grid-cols-[1fr_70px_100px_100px] gap-3 bg-gray-50 px-3 py-2.5 rounded-t'>
								<span className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Description</span>
								<span className='text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center'>Qty</span>
								<span className='text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right'>Amount</span>
								<span className='text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right'>Total</span>
							</div>
							{invoice.items.map((item, i) => (
								<div key={i} className='grid grid-cols-[1fr_70px_100px_100px] gap-3 py-3 border-b border-gray-50 px-3'>
									<span className='text-sm text-gray-800'>{item.description}</span>
									<span className='text-sm text-gray-500 text-center'>{item.hours}</span>
									<span className='text-sm text-gray-500 text-right'>{fmt(item.hourlyRate)}</span>
									<span className='text-sm font-semibold text-gray-900 text-right'>{fmt(item.total)}</span>
								</div>
							))}
						</div>

						{/* Totals */}
						<div className='flex justify-end'>
							<div className='w-56 space-y-2'>
								<div className='flex justify-between text-sm text-gray-500'>
									<span>Subtotal</span><span>{fmt(invoice.subtotal)}</span>
								</div>
								<div className='flex justify-between text-sm text-gray-500'>
									<span>VAT ({invoice.vatRate}%)</span><span>{fmt(invoice.vatAmount)}</span>
								</div>
								<div className='flex justify-between text-base font-extrabold text-gray-900 pt-2.5 border-t-2 border-gray-200'>
									<span>Total</span>
									<span>{fmt(invoice.total)}</span>
								</div>
								{invoice.vatRate === 0 && (
									<p className='text-xs text-blue-600'>VAT reverse-charged</p>
								)}
							</div>
						</div>

						{/* Bank details */}
						{user?.iban && (
							<div className='rounded-lg bg-gray-50 px-5 py-4 space-y-1.5'>
								<p className='text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400'>Payment details</p>
								<p className='text-sm text-gray-700'><span className='text-gray-400 w-10 inline-block text-xs'>IBAN</span>{user.iban}</p>
								{user.bic && <p className='text-sm text-gray-700'><span className='text-gray-400 w-10 inline-block text-xs'>BIC</span>{user.bic}</p>}
							</div>
						)}

						{/* Notes */}
						{invoice.notes && (
							<div className='rounded-lg bg-gray-50 px-5 py-4 text-sm text-gray-600'>
								<span className='font-semibold text-gray-800'>Note: </span>{invoice.notes}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className='mx-10 border-t border-gray-100 py-5 text-center'>
						<p className='text-xs text-gray-400'>
							We kindly ask you to pay {fmt(invoice.total)} before {fmtDate(invoice.dueDate)}, citing payment reference {invoice.invoiceNumber}.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
