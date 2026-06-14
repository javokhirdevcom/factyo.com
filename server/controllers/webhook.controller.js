// controllers/webhook.controller.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Transaction = require('../models/transaction.model.js') // TO'G'RILANDI

const handleStripeWebhook = async (req, res, next) => {
	try {
		const event = req.body

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object
			const { userId, productId } = session.metadata

			const newTransaction = new Transaction({
				id: session.id,
				user: userId,
				product: productId,
				state: 2, // Perform/Success
				amount: session.amount_total / 100,
				provider: 'stripe',
				perform_time: Date.now(),
			})

			await newTransaction.save()
			console.log('=== TRANZAKSIYA BAZAGA SAQLANDI ===', newTransaction._id)
		}

		res.json({ received: true })
	} catch (err) {
		console.error('Webhook error:', err.message)
		res.status(400).send(`Webhook Error: ${err.message}`)
	}
}

module.exports = { handleStripeWebhook }
