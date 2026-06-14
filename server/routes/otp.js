const router = require('express').Router()
const otpController = require('../controllers/otp.controller')

router.post('/send', (req, res, next) => otpController.sendOtp(req, res, next))
router.post('/verify', (req, res, next) => otpController.verifyOtp(req, res, next))

module.exports = router
