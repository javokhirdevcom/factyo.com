const PDFDocument = require('pdfkit')

const fmt = n => `€${Number(n).toFixed(2)}`
const fmtDate = d =>
	new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

const DARK = '#111827'
const GRAY = '#6b7280'
const LIGHT = '#f3f4f6'
const BLUE = '#2563eb'
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 50
const CONTENT_W = PAGE_W - MARGIN * 2

async function generateInvoicePdf({ invoice, client, user }) {
	let logoBuffer = null
	if (user.logoUrl) {
		try {
			const res = await fetch(user.logoUrl)
			const buf = await res.arrayBuffer()
			logoBuffer = Buffer.from(buf)
		} catch {
			logoBuffer = null
		}
	}

	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: 'A4', margin: 0, compress: true })
		const chunks = []
		doc.on('data', c => chunks.push(c))
		doc.on('end', () => resolve(Buffer.concat(chunks)))
		doc.on('error', reject)

		let y = MARGIN + 10

		// ── Header: Logo (left) + Company info (right) ───────────────
		const headerY = y
		if (logoBuffer) {
			try {
				doc.image(logoBuffer, MARGIN, headerY, { height: 44, fit: [150, 44] })
			} catch {
				doc.fontSize(16).font('Helvetica-Bold').fillColor(DARK)
					.text(user.businessName || user.fullName || '', MARGIN, headerY + 4)
			}
		} else {
			doc.fontSize(16).font('Helvetica-Bold').fillColor(DARK)
				.text(user.businessName || user.fullName || '', MARGIN, headerY + 4)
		}

		const INFO_W = 200
		const infoX = PAGE_W - MARGIN - INFO_W
		let ry = headerY
		doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
			.text(user.businessName || user.fullName || '', infoX, ry, { width: INFO_W, align: 'right' })
		ry += 14
		doc.fontSize(8.5).font('Helvetica').fillColor(GRAY)
		if (user.businessAddress) {
			doc.text(user.businessAddress, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}
		if (user.email) {
			doc.text(user.email, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}
		if (user.vatNumber) {
			doc.text(`VAT: ${user.vatNumber}`, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}
		if (user.kvkNumber) {
			doc.text(`CoC: ${user.kvkNumber}`, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}
		if (user.phone) {
			doc.text(user.phone, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}
		if (user.iban) {
			doc.text(`IBAN: ${user.iban}`, infoX, ry, { width: INFO_W, align: 'right' })
			ry += 12
		}

		y = Math.max(headerY + 54, ry) + 18

		// ── Separator ────────────────────────────────────────────────
		doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
		y += 20

		// ── Client block (left) + Invoice meta (right) ───────────────
		const sectionY = y

		doc.fontSize(7.5).font('Helvetica').fillColor(GRAY).text('Invoice to:', MARGIN, y)
		y += 11
		doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK)
			.text(client.name || '', MARGIN, y, { width: 220 })
		y += 14
		doc.fontSize(9).font('Helvetica').fillColor(GRAY)
		if (client.company) { doc.text(client.company, MARGIN, y, { width: 220 }); y += 12 }
		if (client.address) { doc.text(client.address, MARGIN, y, { width: 220 }); y += 12 }
		if (client.btw) { doc.text(`VAT: ${client.btw}`, MARGIN, y, { width: 220 }); y += 12 }
		if (client.kvk) { doc.text(`CoC: ${client.kvk}`, MARGIN, y, { width: 220 }); y += 12 }
		doc.text(client.email || '', MARGIN, y, { width: 220 })
		y += 12

		// Invoice meta (right)
		const metaX = PAGE_W / 2 + 10
		const metaW = PAGE_W - MARGIN - metaX
		let my = sectionY

		doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK)
			.text(`Invoice ${invoice.invoiceNumber}`, metaX, my, { width: metaW, align: 'right' })
		my += 20

		if (user.vatNumber) {
			doc.fontSize(8.5).font('Helvetica').fillColor(GRAY)
				.text(`VAT number: ${user.vatNumber}`, metaX, my, { width: metaW, align: 'right' })
			my += 14
		}
		my += 5

		doc.fontSize(9).font('Helvetica').fillColor(GRAY).text('Invoice date:', metaX, my)
		doc.font('Helvetica-Bold').fillColor(DARK)
			.text(fmtDate(invoice.date), metaX, my, { width: metaW, align: 'right' })
		my += 14

		doc.font('Helvetica').fillColor(GRAY).text('Due date:', metaX, my)
		doc.font('Helvetica-Bold').fillColor(DARK)
			.text(fmtDate(invoice.dueDate), metaX, my, { width: metaW, align: 'right' })

		y = Math.max(y, my + 14) + 18

		// ── Separator ────────────────────────────────────────────────
		doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
		y += 8

		// ── Table header ──────────────────────────────────────────────
		const COL_DESC = MARGIN + 8
		const COL_QTY = MARGIN + CONTENT_W * 0.60
		const COL_RATE = MARGIN + CONTENT_W * 0.72

		doc.rect(MARGIN, y, CONTENT_W, 22).fill(LIGHT)
		doc.fontSize(7).font('Helvetica-Bold').fillColor(GRAY)
			.text('DESCRIPTION', COL_DESC, y + 8)
			.text('QTY', COL_QTY, y + 8)
			.text('AMOUNT', COL_RATE, y + 8)
		doc.text('TOTAL', MARGIN, y + 8, { width: CONTENT_W - 8, align: 'right' })
		y += 26

		// ── Table rows ────────────────────────────────────────────────
		for (const item of invoice.items) {
			doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
				.text(item.description || '', COL_DESC, y, { width: CONTENT_W * 0.54 })
			doc.fillColor(GRAY)
				.text(String(item.hours ?? ''), COL_QTY, y)
				.text(fmt(item.hourlyRate ?? 0), COL_RATE, y)
			doc.font('Helvetica-Bold').fillColor(DARK)
				.text(fmt(item.total ?? 0), MARGIN, y, { width: CONTENT_W - 8, align: 'right' })
			y += 16
			doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#f3f4f6').lineWidth(0.3).stroke()
			y += 6
		}
		y += 10

		// ── Totals ────────────────────────────────────────────────────
		const totW = 140
		const totX = PAGE_W - MARGIN - totW

		doc.fontSize(9).font('Helvetica').fillColor(GRAY)
			.text('Subtotal', totX, y)
			.text(fmt(invoice.subtotal), totX, y, { width: totW, align: 'right' })
		y += 14

		doc.text(`VAT (${invoice.vatRate}%)`, totX, y)
			.text(fmt(invoice.vatAmount), totX, y, { width: totW, align: 'right' })
		y += 8

		doc.moveTo(totX, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke()
		y += 10

		doc.fontSize(12).font('Helvetica-Bold').fillColor(DARK)
			.text('Total', totX, y)
			.text(fmt(invoice.total), totX, y, { width: totW, align: 'right' })
		y += 20

		// ── VAT reverse charge ─────────────────────────────────────────
		if (invoice.vatRate === 0) {
			doc.fontSize(9).font('Helvetica').fillColor(BLUE)
				.text('VAT reverse-charged', MARGIN, y)
			y += 18
		}

		// ── Notes ─────────────────────────────────────────────────────
		if (invoice.notes) {
			doc.rect(MARGIN, y, CONTENT_W, 38).fill('#f9fafb')
			doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK)
				.text('Note: ', COL_DESC, y + 12)
			doc.font('Helvetica').fillColor(GRAY)
				.text(invoice.notes, COL_DESC + 42, y + 12, { width: CONTENT_W - 50 })
			y += 44
		}

		// ── Footer ─────────────────────────────────────────────────────
		const footerY = PAGE_H - 50
		doc.moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY).strokeColor('#e5e7eb').lineWidth(0.3).stroke()
		doc.fontSize(8.5).font('Helvetica').fillColor(GRAY)
			.text(
				`We kindly ask you to pay ${fmt(invoice.total)} before ${fmtDate(invoice.dueDate)}, citing payment reference ${invoice.invoiceNumber}.`,
				MARGIN, footerY + 12, { width: CONTENT_W, align: 'center' }
			)

		doc.end()
	})
}

module.exports = { generateInvoicePdf }
