const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')

class UserController {
	async getUserProfile(req, res, next) {
		try {
			const user = await userModel.findById(req.params.id).select('-password')
			if (!user) {
				console.error('[getUserProfile] No user for id:', req.params.id)
				return res.json({ failure: 'User not found' })
			}
			return res.json({ success: true, user })
		} catch (err) {
			console.error('[getUserProfile] Error for id:', req.params.id, '—', err.message)
			return res.json({ failure: err.message || 'Failed to fetch user profile.' })
		}
	}

	async updateProfile(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const {
				fullName, businessName, businessAddress,
				vatNumber, kvkNumber, phone, website,
				iban, bic, avatarUrl, logoUrl,
			} = req.body

			const user = await userModel.findById(userId)
			if (!user) return res.json({ failure: 'User not found' })

			if (fullName) user.fullName = fullName
			if (businessName !== undefined) user.businessName = businessName
			if (businessAddress !== undefined) user.businessAddress = businessAddress
			if (vatNumber !== undefined) user.vatNumber = vatNumber
			if (kvkNumber !== undefined) user.kvkNumber = kvkNumber
			if (phone !== undefined) user.phone = phone
			if (website !== undefined) user.website = website
			if (iban !== undefined) user.iban = iban
			if (bic !== undefined) user.bic = bic
			if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
			if (logoUrl !== undefined) user.logoUrl = logoUrl

			await user.save()
			const updated = user.toObject()
			delete updated.password
			return res.json({ success: 'Profile updated', user: updated })
		} catch (err) {
			console.error('[updateProfile] Error:', err.message)
			return res.json({ failure: err.message || 'Failed to update profile.' })
		}
	}

	async changePassword(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const { currentPassword, newPassword } = req.body
			const user = await userModel.findById(userId)
			if (!user) return res.json({ failure: 'User not found' })

			if (!user.password) return res.json({ failure: 'Cannot change password for OAuth accounts.' })

			const isMatch = await bcrypt.compare(currentPassword, user.password)
			if (!isMatch) return res.json({ failure: 'Current password is incorrect' })

			user.password = await bcrypt.hash(newPassword, 10)
			await user.save()
			return res.json({ success: 'Password changed successfully' })
		} catch (err) {
			console.error('[changePassword] Error:', err.message)
			return res.json({ failure: err.message || 'Failed to change password.' })
		}
	}

	async getProducts(req, res, next) {
		try {
			const products = [
				{
					key: 'basic',
					name: 'Basic',
					price: 800,
					currency: 'eur',
					interval: 'month',
					invoices: 10,
					priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
				},
				{
					key: 'unlimited',
					name: 'Unlimited',
					price: 999,
					currency: 'eur',
					interval: 'month',
					invoices: null,
					priceId: process.env.STRIPE_UNLIMITED_PRICE_ID || '',
				},
			]
			return res.json({ success: true, products })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UserController()
