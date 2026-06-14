const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/user.model')

const PLAN_PRICE_IDS = {
	basic: process.env.FACTYO_BASIC_PLAN_ID,
	unlimited: process.env.FACTYO_UNLIMITED_PLAN_ID,
}

class StripeController {
	async createCheckout(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const { plan } = req.body
			const priceId = PLAN_PRICE_IDS[plan]
			if (!priceId) return res.json({ failure: 'Invalid plan selected.' })

			const user = await User.findById(userId)
			if (!user) return res.json({ failure: 'User not found' })

			let customerId = user.customerId
			if (!customerId) {
				const customer = await stripe.customers.create({
					email: user.email,
					name: user.fullName,
					metadata: { userId: String(user._id) },
				})
				customerId = customer.id
				user.customerId = customerId
				await user.save()
			}

			const session = await stripe.checkout.sessions.create({
				customer: customerId,
				payment_method_types: ['card'],
				line_items: [{ price: priceId, quantity: 1 }],
				mode: 'subscription',
				success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${process.env.CLIENT_URL}/pricing`,
				metadata: { userId: String(user._id), plan },
			})

			return res.json({ success: true, url: session.url })
		} catch (err) {
			next(err)
		}
	}

	async getPortal(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const user = await User.findById(userId)
			if (!user?.customerId) return res.json({ failure: 'No billing account found.' })

			const session = await stripe.billingPortal.sessions.create({
				customer: user.customerId,
				return_url: `${process.env.CLIENT_URL}/dashboard/settings`,
			})

			return res.json({ success: true, url: session.url })
		} catch (err) {
			next(err)
		}
	}

	async cancelSubscription(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const user = await User.findById(userId)
			if (!user?.subscriptionId) return res.json({ failure: 'No active subscription found.' })

			await stripe.subscriptions.cancel(user.subscriptionId)

			user.plan = 'free'
			user.subscriptionId = ''
			await user.save()

			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}

	async handleWebhook(req, res) {
		const sig = req.headers['stripe-signature']
		let event

		try {
			event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
		} catch (err) {
			return res.status(400).json({ failure: `Webhook error: ${err.message}` })
		}

		try {
			if (event.type === 'checkout.session.completed') {
				const session = event.data.object
				const userId = session.metadata?.userId
				const plan = session.metadata?.plan
				if (userId && plan) {
					await User.findByIdAndUpdate(userId, {
						plan,
						subscriptionId: session.subscription || '',
						customerId: session.customer || '',
					})
				}
			}

			if (event.type === 'customer.subscription.deleted') {
				const sub = event.data.object
				await User.findOneAndUpdate(
					{ subscriptionId: sub.id },
					{ plan: 'free', subscriptionId: '' }
				)
			}

			return res.json({ received: true })
		} catch (err) {
			return res.status(500).json({ failure: 'Webhook handler error.' })
		}
	}
}

module.exports = new StripeController()
