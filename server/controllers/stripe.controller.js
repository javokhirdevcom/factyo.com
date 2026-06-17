const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/user.model')

const PLAN_PRICE_IDS = {
	basic: process.env.FACTYO_BASIC_PLAN_ID,
	unlimited: process.env.FACTYO_UNLIMITED_PLAN_ID,
}

const CLIENT_URL = process.env.CLIENT_URL || 'https://www.factyo.com'

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
				success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${CLIENT_URL}/pricing`,
				metadata: { userId: String(user._id), plan },
			})

			return res.json({ success: true, url: session.url })
		} catch (err) {
			console.error('[stripe] createCheckout error:', err.message)
			return res.json({ failure: err.message || 'Failed to create checkout session.' })
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
				return_url: `${CLIENT_URL}/dashboard/settings`,
			})

			return res.json({ success: true, url: session.url })
		} catch (err) {
			console.error('[stripe] getPortal error:', err.message)
			return res.json({ failure: err.message || 'Failed to open billing portal.' })
		}
	}

	// Cancel at end of current billing period — user keeps access until then
	async cancelSubscription(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const user = await User.findById(userId)
			if (!user?.subscriptionId) return res.json({ failure: 'No active subscription found.' })

			const updated = await stripe.subscriptions.update(user.subscriptionId, {
				cancel_at_period_end: true,
			})

			user.subscriptionStatus = 'cancelling'
			user.subscriptionCurrentPeriodEnd = new Date(updated.current_period_end * 1000)
			await user.save()

			return res.json({
				success: true,
				endsAt: user.subscriptionCurrentPeriodEnd,
			})
		} catch (err) {
			console.error('[stripe] cancelSubscription error:', err.message)
			return res.json({ failure: err.message || 'Failed to cancel subscription.' })
		}
	}

	// Undo a pending cancellation — resumes subscription normally
	async reactivateSubscription(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const user = await User.findById(userId)
			if (!user?.subscriptionId) return res.json({ failure: 'No subscription found.' })

			await stripe.subscriptions.update(user.subscriptionId, {
				cancel_at_period_end: false,
			})

			user.subscriptionStatus = 'active'
			await user.save()

			return res.json({ success: true })
		} catch (err) {
			console.error('[stripe] reactivateSubscription error:', err.message)
			return res.json({ failure: err.message || 'Failed to reactivate subscription.' })
		}
	}

	async handleWebhook(req, res) {
		const sig = req.headers['stripe-signature']
		let event

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET,
			)
		} catch (err) {
			console.error('[webhook] Signature verification failed:', err.message)
			return res.status(400).json({ failure: `Webhook error: ${err.message}` })
		}

		try {
			switch (event.type) {
				// --- New subscription created via Stripe Checkout ---
				case 'checkout.session.completed': {
					const session = event.data.object
					const userId = session.metadata?.userId
					const plan = session.metadata?.plan
					if (!userId || !plan) break

					// Fetch the subscription to get period end
					const sub = await stripe.subscriptions.retrieve(session.subscription)

					await User.findByIdAndUpdate(userId, {
						plan,
						subscriptionId: sub.id,
						customerId: session.customer,
						subscriptionStatus: 'active',
						subscriptionCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
					})
					console.log(`[webhook] checkout.session.completed userId=${userId} plan=${plan}`)
					break
				}

				// --- Subscription updated (cancel_at_period_end, status change, renewal) ---
				case 'customer.subscription.updated': {
					const sub = event.data.object
					const user = await User.findOne({ subscriptionId: sub.id })
					if (!user) break

					const periodEnd = new Date(sub.current_period_end * 1000)

					if (sub.status === 'past_due') {
						user.subscriptionStatus = 'past_due'
					} else if (sub.cancel_at_period_end) {
						user.subscriptionStatus = 'cancelling'
					} else if (sub.status === 'active') {
						user.subscriptionStatus = 'active'
					}

					user.subscriptionCurrentPeriodEnd = periodEnd
					await user.save()
					console.log(`[webhook] subscription.updated id=${sub.id} status=${user.subscriptionStatus}`)
					break
				}

				// --- Subscription fully deleted (period ended or immediate cancel) ---
				case 'customer.subscription.deleted': {
					const sub = event.data.object
					await User.findOneAndUpdate(
						{ subscriptionId: sub.id },
						{
							plan: 'free',
							subscriptionId: '',
							subscriptionStatus: '',
							subscriptionCurrentPeriodEnd: null,
						},
					)
					console.log(`[webhook] subscription.deleted id=${sub.id}`)
					break
				}

				// --- Recurring payment succeeded → renew period end date ---
				case 'invoice.paid': {
					const invoice = event.data.object
					// Only act on subscription renewal invoices
					if (invoice.billing_reason !== 'subscription_cycle') break

					const user = await User.findOne({ customerId: invoice.customer })
					if (!user?.subscriptionId) break

					const sub = await stripe.subscriptions.retrieve(user.subscriptionId)
					user.subscriptionCurrentPeriodEnd = new Date(sub.current_period_end * 1000)
					// Keep 'cancelling' status if user already requested cancel
					if (user.subscriptionStatus !== 'cancelling') {
						user.subscriptionStatus = 'active'
					}
					await user.save()
					console.log(`[webhook] invoice.paid renewal customerId=${invoice.customer}`)
					break
				}

				// --- Recurring payment failed → warn user ---
				case 'invoice.payment_failed': {
					const invoice = event.data.object
					await User.findOneAndUpdate(
						{ customerId: invoice.customer },
						{ subscriptionStatus: 'past_due' },
					)
					console.log(`[webhook] invoice.payment_failed customerId=${invoice.customer}`)
					break
				}

				default:
					break
			}

			return res.json({ received: true })
		} catch (err) {
			console.error('[webhook] Handler error:', err.message)
			return res.status(500).json({ failure: 'Webhook handler error.' })
		}
	}
}

module.exports = new StripeController()
