const mailService = require('../services/mail.service')
const userModel = require('../models/user.model')
const SystemConfig = require('../models/system-config.model')

class OtpController {
	async sendOtp(req, res, next) {
		try {
			const { email } = req.body
			if (!email) return res.json({ failure: 'Email is required.' })

			const config = await SystemConfig.getConfig()

			if (!config.otpEnabled) {
				await userModel.findOneAndUpdate({ email }, { isVerified: true })
				return res.json({ success: true, skipOtp: true })
			}

			await mailService.sendOtpMail(email)
			return res.json({ success: true })
		} catch (err) {
			console.error('[otp] sendOtp error:', err.message)
			return res.json({ failure: err.message || 'Failed to send verification code. Please try again.' })
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

			await userModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true })
			return res.json({ success: true })
		} catch (err) {
			console.error('[otp] verifyOtp error:', err.message)
			return res.json({ success: false, message: err.message || 'Verification failed.' })
		}
	}
}

module.exports = new OtpController()
