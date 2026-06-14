const mailService = require('../services/mail.service')
const userModel = require('../models/user.model')

class OtpController {
	async sendOtp(req, res, next) {
		try {
			const { email } = req.body
			if (!email) return res.json({ failure: 'Email is required.' })

			await mailService.sendOtpMail(email)
			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}

	async verifyOtp(req, res, next) {
		try {
			const { email, otp } = req.body
			if (!email || !otp) {
				return res.json({ success: false, message: 'Email and code are required.' })
			}

			const result = await mailService.verifyOtp(email, otp)
			if (!result.success) {
				return res.json({ success: false, message: result.message })
			}

			// Mark user verified so verify-activate can succeed
			await userModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true })

			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new OtpController()
