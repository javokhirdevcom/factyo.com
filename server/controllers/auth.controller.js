const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken') // Token yaratish uchun qo'shdik

class AuthController {
	async register(req, res, next) {
		try {
			const { fullName, email, password } = req.body
			if (!fullName || !email || !password) {
				// HTTP 400 Bad Request qaytaramiz
				return res.status(400).json({ failure: 'All fields are required.' })
			}

			const existing = await userModel.findOne({ email, isDeleted: false })
			if (existing) {
				if (existing.isVerified) {
					return res
						.status(400)
						.json({ failure: 'An account with this email already exists.' })
				}
				// Unverified — update and let them re-verify
				existing.fullName = fullName
				existing.password = await bcrypt.hash(password, 10)
				await existing.save()
				return res
					.status(200)
					.json({
						success: true,
						user: { _id: existing._id, email: existing.email },
					})
			}

			const hashed = await bcrypt.hash(password, 10)
			const user = await userModel.create({
				fullName,
				email,
				password: hashed,
				isVerified: false,
			})
			return res
				.status(201)
				.json({ success: true, user: { _id: user._id, email: user.email } })
		} catch (err) {
			next(err)
		}
	}

	async login(req, res, next) {
		try {
			const { email, password } = req.body
			if (!email || !password) {
				return res
					.status(400)
					.json({ failure: 'Email and password are required.' })
			}

			const user = await userModel.findOne({ email, isDeleted: false })
			if (!user) {
				return res
					.status(401)
					.json({ failure: 'No account found with this email.' })
			}

			if (!user.isVerified) {
				return res
					.status(403)
					.json({ failure: 'Please verify your email before logging in.' })
			}

			const match = await bcrypt.compare(password, user.password)
			if (!match) {
				return res.status(401).json({ failure: 'Incorrect password.' })
			}

			// 1. JWT Token yaratamiz (agar frontend NextAuth bo'lsa yoki tokenni sarlavhada kutsa)
			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback_secret',
				{ expiresIn: '30d' },
			)

			// 2. Cookieni productionbop qilib brauzerga yozamiz (Qotishni oldini oladi)
			res.cookie('token', token, {
				httpOnly: true,
				secure: true, // HTTPS uchun shart (Vercel/Railway)
				sameSite: 'none', // Cross-domain cookie o'tishi uchun SHART!
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			const safe = user.toObject()
			delete safe.password

			// Tokonni ham javob bilan birga qaytaramiz
			return res.status(200).json({ success: true, token, user: safe })
		} catch (err) {
			next(err)
		}
	}

	async oauthSignin(req, res, next) {
		try {
			const { email, name, provider } = req.body
			if (!email) return res.status(400).json({ failure: 'Email is required.' })

			let user = await userModel.findOne({ email, isDeleted: false })
			if (!user) {
				user = await userModel.create({
					email,
					fullName: name || email.split('@')[0],
					provider: provider || 'google',
					isVerified: true,
				})
			}

			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback_secret',
				{ expiresIn: '30d' },
			)

			res.cookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			const safe = user.toObject()
			delete safe.password
			return res.status(200).json({ success: true, token, user: safe })
		} catch (err) {
			next(err)
		}
	}

	async verifyActivate(req, res, next) {
		try {
			const { email } = req.body
			if (!email) return res.status(400).json({ failure: 'Email is required.' })

			const user = await userModel
				.findOneAndUpdate(
					{ email, isDeleted: false },
					{ isVerified: true },
					{ new: true },
				)
				.select('-password')

			if (!user) return res.status(404).json({ failure: 'User not found.' })
			return res.status(200).json({ success: true, user })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AuthController()
