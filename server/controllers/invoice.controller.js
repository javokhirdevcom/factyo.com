const Invoice = require('../models/invoice.model')
const Client = require('../models/client.model')
const User = require('../models/user.model')
const { sendInvoiceEmail } = require('../services/email.service')

const PLAN_LIMITS = { free: 3, basic: 10, unlimited: Infinity }

class InvoiceController {
	async getInvoices(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const invoices = await Invoice.find({ userId })
				.populate('clientId', 'name email company')
				.sort({ createdAt: -1 })

			return res.json({ success: true, invoices })
		} catch (err) {
			next(err)
		}
	}

	async getInvoice(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const invoice = await Invoice.findOne({ _id: req.params.id, userId }).populate('clientId')
			if (!invoice) return res.json({ failure: 'Invoice not found' })

			return res.json({ success: true, invoice })
		} catch (err) {
			next(err)
		}
	}

	async createInvoice(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const user = await User.findById(userId)
			if (!user) return res.status(404).json({ failure: 'User not found' })

			const limit = PLAN_LIMITS[user.plan] ?? 1
			if (user.invoiceCount >= limit) {
				return res.json({
					failure:
						user.plan === 'free'
							? 'Free plan allows 3 invoices. Upgrade to create more.'
							: 'Invoice limit reached for your plan. Upgrade to Unlimited.',
					limitReached: true,
				})
			}

			const { clientId, invoiceNumber, date, dueDate, items, vatRate, notes } = req.body

			const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0)
			const vatAmount = subtotal * (Number(vatRate) / 100)
			const total = subtotal + vatAmount

			const invoice = await Invoice.create({
				userId,
				clientId,
				invoiceNumber,
				date,
				dueDate,
				items,
				subtotal,
				vatRate: Number(vatRate),
				vatAmount,
				total,
				notes: notes || '',
			})

			user.invoiceCount = (user.invoiceCount || 0) + 1
			user.invoiceSequence = (user.invoiceSequence || 0) + 1
			await user.save()

			return res.json({ success: true, invoice })
		} catch (err) {
			next(err)
		}
	}

	async updateInvoice(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const updates = {}
			const { clientId, invoiceNumber, date, dueDate, items, vatRate, notes, status } = req.body

			if (status) updates.status = status
			if (clientId) updates.clientId = clientId
			if (invoiceNumber) updates.invoiceNumber = invoiceNumber
			if (date) updates.date = date
			if (dueDate) updates.dueDate = dueDate
			if (notes !== undefined) updates.notes = notes

			if (items) {
				const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0)
				const vatAmount = subtotal * (Number(vatRate ?? 0) / 100)
				updates.items = items
				updates.subtotal = subtotal
				updates.vatRate = Number(vatRate ?? 0)
				updates.vatAmount = vatAmount
				updates.total = subtotal + vatAmount
			}

			const invoice = await Invoice.findOneAndUpdate(
				{ _id: req.params.id, userId },
				updates,
				{ new: true }
			).populate('clientId')

			if (!invoice) return res.json({ failure: 'Invoice not found' })
			return res.json({ success: true, invoice })
		} catch (err) {
			next(err)
		}
	}

	async deleteInvoice(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId })
			if (!invoice) return res.json({ failure: 'Invoice not found' })

			// Note: intentionally NOT decrementing invoiceCount so free users
			// cannot bypass the plan limit by deleting and recreating invoices.

			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}

	async sendInvoice(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const invoice = await Invoice.findOne({ _id: req.params.id, userId }).populate('clientId')
			if (!invoice) return res.json({ failure: 'Invoice not found' })

			const user = await User.findById(userId)
			if (!user) return res.json({ failure: 'User not found' })

			const client = await Client.findById(invoice.clientId)
			if (!client) return res.json({ failure: 'Client not found' })

			await sendInvoiceEmail({ invoice, client, user })

			invoice.status = 'sent'
			await invoice.save()

			return res.json({ success: 'Invoice sent successfully' })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new InvoiceController()
