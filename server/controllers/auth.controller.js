const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const sign = (user) =>
	jwt.sign(
		{ id: user._id, role: user.role },
		process.env.JWT_SECRET || 'fallback_secret',
		{ expiresIn: '30d' },
	)

const setCookie = (res, token) =>
	res.cookie('token', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		maxAge: 30 * 24 * 60 * 60 * 1000,
	})

class AuthController {
	async register(req, res, next) {
		try {
			const { fullName, email, password } = req.body
			if (!fullName || !email || !password) {
				return res.json({ failure: 'All fields are required.' })
			}

			const existing = await userModel.findOne({ email, isDeleted: false })
			if (existing) {
				if (existing.isVerified) {
					return res.json({ failure: 'An account with this email already exists.' })
				}
				// Unverified — update and let them re-verify
				existing.fullName = fullName
				existing.password = await bcrypt.hash(password, 10)
				await existing.save()
				return res.json({ success: true, user: { _id: existing._id, email: existing.email } })
			}

			const hashed = await bcrypt.hash(password, 10)
			const user = await userModel.create({ fullName, email, password: hashed, isVerified: false })
			return res.json({ success: true, user: { _id: user._id, email: user.email } })
		} catch (err) {
			console.error('[register] Error:', err.message)
			return res.json({ failure: err.message || 'Registration failed.' })
		}
	}

	async login(req, res, next) {
		try {
			const { email, password } = req.body
			if (!email || !password) {
				return res.json({ failure: 'Email and password are required.' })
			}

			const user = await userModel.findOne({ email, isDeleted: false })
			if (!user) {
				return res.json({ failure: 'No account found with this email.' })
			}

			// Auto-verify any legacy unverified accounts (OTP is disabled)
			if (!user.isVerified) {
				user.isVerified = true
				await user.save()
			}

			const match = await bcrypt.compare(password, user.password)
			if (!match) {
				return res.json({ failure: 'Incorrect password.' })
			}

			const token = sign(user)
			setCookie(res, token)

			const safe = user.toObject()
			delete safe.password
			return res.json({ success: true, token, user: safe })
		} catch (err) {
			console.error('[login] Error:', err.message)
			return res.json({ failure: err.message || 'Login failed.' })
		}
	}

	async oauthSignin(req, res, next) {
		try {
			const { email, name, provider } = req.body
			if (!email) return res.json({ failure: 'Email is required.' })

			let user = await userModel.findOne({ email, isDeleted: false })
			if (!user) {
				user = await userModel.create({
					email,
					fullName: name || email.split('@')[0],
					provider: provider || 'google',
					isVerified: true,
				})
			}

			const token = sign(user)
			setCookie(res, token)

			const safe = user.toObject()
			delete safe.password
			return res.json({ success: true, token, user: safe })
		} catch (err) {
			console.error('[oauthSignin] Error:', err.message)
			return res.json({ failure: err.message || 'OAuth sign-in failed.' })
		}
	}

	async verifyActivate(req, res, next) {
		try {
			const { email } = req.body
			if (!email) return res.json({ failure: 'Email is required.' })

			const user = await userModel
				.findOneAndUpdate({ email, isDeleted: false }, { isVerified: true }, { new: true })
				.select('-password')

			if (!user) return res.json({ failure: 'User not found.' })
			return res.json({ success: true, user })
		} catch (err) {
			console.error('[verifyActivate] Error:', err.message)
			return res.json({ failure: err.message || 'Verification failed.' })
		}
	}
}

module.exports = new AuthController()
