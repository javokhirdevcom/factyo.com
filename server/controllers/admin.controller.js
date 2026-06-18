const User = require('../models/user.model')
const Invoice = require('../models/invoice.model')
const SystemConfig = require('../models/system-config.model')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class AdminController {
	// ─── Overview stats ──────────────────────────────────────────────────────
	async getStats(req, res, next) {
		try {
			const [
				totalUsers,
				verifiedUsers,
				unverifiedUsers,
				bannedUsers,
				totalInvoices,
				paidInvoices,
				basicUsers,
				unlimitedUsers,
				activeSubscriptions,
				cancellingSubscriptions,
				pastDueSubscriptions,
			] = await Promise.all([
				User.countDocuments({ isDeleted: false }),
				User.countDocuments({ isDeleted: false, isVerified: true }),
				User.countDocuments({ isDeleted: false, isVerified: false }),
				User.countDocuments({ isDeleted: false, isBanned: true }),
				Invoice.countDocuments({}),
				Invoice.countDocuments({ status: 'paid' }),
				User.countDocuments({ plan: 'basic', isDeleted: false }),
				User.countDocuments({ plan: 'unlimited', isDeleted: false }),
				User.countDocuments({ subscriptionStatus: 'active', isDeleted: false }),
				User.countDocuments({ subscriptionStatus: 'cancelling', isDeleted: false }),
				User.countDocuments({ subscriptionStatus: 'past_due', isDeleted: false }),
			])

			const revenueAgg = await Invoice.aggregate([
				{ $match: { status: 'paid' } },
				{ $group: { _id: null, total: { $sum: '$total' } } },
			])

			// Monthly revenue (last 12 months)
			const now = new Date()
			const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
			const monthlyRevenue = await Invoice.aggregate([
				{ $match: { status: 'paid', createdAt: { $gte: twelveMonthsAgo } } },
				{
					$group: {
						_id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
						total: { $sum: '$total' },
						count: { $sum: 1 },
					},
				},
				{ $sort: { '_id.year': 1, '_id.month': 1 } },
			])

			const recentUsers = await User.find({ isDeleted: false })
				.select('-password')
				.sort({ createdAt: -1 })
				.limit(8)

			return res.json({
				success: true,
				stats: {
					totalUsers,
					verifiedUsers,
					unverifiedUsers,
					bannedUsers,
					totalInvoices,
					paidInvoices,
					basicUsers,
					unlimitedUsers,
					activeSubscriptions,
					cancellingSubscriptions,
					pastDueSubscriptions,
					totalRevenue: revenueAgg[0]?.total ?? 0,
					monthlyRevenue,
				},
				recentUsers,
			})
		} catch (err) {
			console.error('[admin] getStats error:', err.message)
			next(err)
		}
	}

	// ─── User list ────────────────────────────────────────────────────────────
	async getUsers(req, res, next) {
		try {
			const { search = '', page = 1, limit = 50, plan, status } = req.query
			const query = { isDeleted: false }

			if (search) {
				query.$or = [
					{ email: { $regex: search, $options: 'i' } },
					{ fullName: { $regex: search, $options: 'i' } },
				]
			}
			if (plan && plan !== 'all') query.plan = plan
			if (status === 'verified') query.isVerified = true
			if (status === 'unverified') query.isVerified = false
			if (status === 'banned') query.isBanned = true

			const [users, total] = await Promise.all([
				User.find(query)
					.select('-password')
					.sort({ createdAt: -1 })
					.skip((page - 1) * limit)
					.limit(Number(limit)),
				User.countDocuments(query),
			])

			return res.json({ success: true, users, total })
		} catch (err) {
			next(err)
		}
	}

	// ─── User detail (profile + invoices) ────────────────────────────────────
	async getUserDetail(req, res, next) {
		try {
			const { id } = req.params
			const user = await User.findById(id).select('-password')
			if (!user) return res.json({ failure: 'User not found.' })

			const invoices = await Invoice.find({ userId: id })
				.sort({ createdAt: -1 })
				.limit(20)

			return res.json({ success: true, user, invoices })
		} catch (err) {
			next(err)
		}
	}

	// ─── Verify / Unverify ────────────────────────────────────────────────────
	async verifyUser(req, res, next) {
		try {
			const { id } = req.params
			const user = await User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	async unverifyUser(req, res, next) {
		try {
			const { id } = req.params
			const user = await User.findByIdAndUpdate(id, { isVerified: false }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	// ─── Ban / Unban ──────────────────────────────────────────────────────────
	async banUser(req, res, next) {
		try {
			const { id } = req.params
			if (String(id) === String(req.user._id)) {
				return res.json({ failure: 'You cannot ban yourself.' })
			}
			const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	async unbanUser(req, res, next) {
		try {
			const { id } = req.params
			const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	// ─── Role ─────────────────────────────────────────────────────────────────
	async updateUserRole(req, res, next) {
		try {
			const { id } = req.params
			const { role } = req.body
			if (!['user', 'admin'].includes(role)) return res.json({ failure: 'Invalid role' })
			if (String(id) === String(req.user._id) && role !== 'admin') {
				return res.json({ failure: 'You cannot demote yourself.' })
			}
			const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	// ─── Force plan change ────────────────────────────────────────────────────
	async updateUserPlan(req, res, next) {
		try {
			const { id } = req.params
			const { plan } = req.body
			if (!['free', 'basic', 'unlimited'].includes(plan)) return res.json({ failure: 'Invalid plan.' })

			const update = { plan }
			if (plan === 'free') {
				update.subscriptionStatus = ''
				update.subscriptionCurrentPeriodEnd = null
			}

			const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	// ─── Cancel Stripe subscription from admin ────────────────────────────────
	async cancelUserSubscription(req, res, next) {
		try {
			const { id } = req.params
			const user = await User.findById(id)
			if (!user?.subscriptionId) return res.json({ failure: 'No active subscription.' })

			await stripe.subscriptions.update(user.subscriptionId, { cancel_at_period_end: true })
			user.subscriptionStatus = 'cancelling'
			await user.save()

			return res.json({ success: true })
		} catch (err) {
			console.error('[admin] cancelUserSubscription:', err.message)
			return res.json({ failure: err.message || 'Failed to cancel subscription.' })
		}
	}

	// ─── Soft delete ─────────────────────────────────────────────────────────
	async deleteUser(req, res, next) {
		try {
			const { id } = req.params
			if (String(id) === String(req.user._id)) {
				return res.json({ failure: 'You cannot delete yourself.' })
			}
			await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() })
			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}

	// ─── Settings ─────────────────────────────────────────────────────────────
	async getSettings(req, res, next) {
		try {
			const config = await SystemConfig.getConfig()
			return res.json({ success: true, settings: config })
		} catch (err) {
			next(err)
		}
	}

	async updateSettings(req, res, next) {
		try {
			const { otpEnabled, maintenanceMode } = req.body
			if (typeof otpEnabled === 'boolean') {
				await SystemConfig.setValue('otpEnabled', otpEnabled)
			}
			if (typeof maintenanceMode === 'boolean') {
				await SystemConfig.setValue('maintenanceMode', maintenanceMode)
			}
			const config = await SystemConfig.getConfig()
			return res.json({ success: true, settings: config })
		} catch (err) {
			next(err)
		}
	}

	// ─── Revenue chart data ───────────────────────────────────────────────────
	async getRevenueData(req, res, next) {
		try {
			const { months = 12 } = req.query
			const start = new Date()
			start.setMonth(start.getMonth() - Number(months) + 1)
			start.setDate(1)
			start.setHours(0, 0, 0, 0)

			const data = await Invoice.aggregate([
				{ $match: { status: 'paid', createdAt: { $gte: start } } },
				{
					$group: {
						_id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
						revenue: { $sum: '$total' },
						count: { $sum: 1 },
					},
				},
				{ $sort: { '_id.year': 1, '_id.month': 1 } },
			])

			const planBreakdown = await User.aggregate([
				{ $match: { isDeleted: false } },
				{ $group: { _id: '$plan', count: { $sum: 1 } } },
			])

			return res.json({ success: true, data, planBreakdown })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AdminController()
