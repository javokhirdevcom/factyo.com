const User = require('../models/user.model')
const Invoice = require('../models/invoice.model')
const SystemConfig = require('../models/system-config.model')

class AdminController {
	async getStats(req, res, next) {
		try {
			const [totalUsers, verifiedUsers, unverifiedUsers, totalInvoices, paidInvoices, basicUsers, unlimitedUsers] =
				await Promise.all([
					User.countDocuments({ isDeleted: false }),
					User.countDocuments({ isDeleted: false, isVerified: true }),
					User.countDocuments({ isDeleted: false, isVerified: false }),
					Invoice.countDocuments({}),
					Invoice.countDocuments({ status: 'paid' }),
					User.countDocuments({ plan: 'basic', isDeleted: false }),
					User.countDocuments({ plan: 'unlimited', isDeleted: false }),
				])

			const revenueAgg = await Invoice.aggregate([
				{ $match: { status: 'paid' } },
				{ $group: { _id: null, total: { $sum: '$total' } } },
			])

			const recentUsers = await User.find({ isDeleted: false })
				.select('-password')
				.sort({ createdAt: -1 })
				.limit(5)

			return res.json({
				success: true,
				stats: {
					totalUsers,
					verifiedUsers,
					unverifiedUsers,
					totalInvoices,
					paidInvoices,
					basicUsers,
					unlimitedUsers,
					totalRevenue: revenueAgg[0]?.total ?? 0,
				},
				recentUsers,
			})
		} catch (err) {
			next(err)
		}
	}

	async getUsers(req, res, next) {
		try {
			const { search = '', page = 1, limit = 50 } = req.query
			const query = { isDeleted: false }
			if (search) {
				query.$or = [
					{ email: { $regex: search, $options: 'i' } },
					{ fullName: { $regex: search, $options: 'i' } },
				]
			}

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

	async updateUserRole(req, res, next) {
		try {
			const { id } = req.params
			const { role } = req.body
			if (!['user', 'admin'].includes(role)) return res.json({ failure: 'Invalid role' })
			const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
			if (!user) return res.json({ failure: 'User not found' })
			return res.json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}

	async deleteUser(req, res, next) {
		try {
			const { id } = req.params
			await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() })
			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}

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
			const { otpEnabled } = req.body
			if (typeof otpEnabled === 'boolean') {
				await SystemConfig.setValue('otpEnabled', otpEnabled)
			}
			const config = await SystemConfig.getConfig()
			return res.json({ success: true, settings: config })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AdminController()
