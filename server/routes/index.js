const router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('/otp', require('./otp'))
router.use('/user', require('./user'))
router.use('/invoices', require('./invoice'))
router.use('/clients', require('./client'))
router.use('/stripe', require('./stripe.route'))
router.use('/admin', require('./admin.route'))

module.exports = router
