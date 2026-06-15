const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const otpModel = require('../models/otp.model')

class MailService {
	getTransporter() {
		const port = parseInt(process.env.SMTP_PORT || '465', 10)
		return nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port,
			secure: port === 465,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
			tls: { rejectUnauthorized: false },
		})
	}

	async sendOtpMail(email) {
		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const hashedOtp = await bcrypt.hash(code, 10)

		await otpModel.deleteMany({ email })
		await otpModel.create({
			email,
			otp: hashedOtp,
			expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
		})

		const transporter = this.getTransporter()
		await transporter.sendMail({
			from: `"Factyo" <${process.env.SMTP_USER}>`,
			to: email,
			subject: 'Your Factyo verification code',
			html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="padding:32px 36px 24px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Verify your email</h2>
      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
        Use the code below to verify your email address. It expires in 10 minutes.
      </p>
      <div style="text-align:center;background:#f9fafb;border-radius:8px;padding:24px 16px;border:1px solid #e5e7eb;">
        <span style="font-size:38px;font-weight:800;letter-spacing:0.35em;color:#111827;">${code}</span>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`,
		})
	}

	async verifyOtp(email, otp) {
		const record = await otpModel.findOne({ email }).sort({ createdAt: -1 })

		if (!record) {
			return { success: false, message: 'Code not found. Please request a new one.' }
		}

		if (record.expireAt < new Date()) {
			await otpModel.deleteMany({ email })
			return { success: false, message: 'Code expired. Please request a new one.' }
		}

		const isValid = await bcrypt.compare(otp, record.otp)
		if (!isValid) {
			return { success: false, message: 'Invalid verification code.' }
		}

		await otpModel.deleteMany({ email })
		return { success: true }
	}
}

module.exports = new MailService()
