const router = require('express').Router()
const stripeController = require('../controllers/stripe.controller')

router.post('/create-checkout', (req, res, next) => stripeController.createCheckout(req, res, next))
router.post('/portal', (req, res, next) => stripeController.getPortal(req, res, next))
router.post('/cancel', (req, res, next) => stripeController.cancelSubscription(req, res, next))
router.post('/reactivate', (req, res, next) => stripeController.reactivateSubscription(req, res, next))

// Webhook is registered in app.js BEFORE express.json() so it receives raw body
// Do NOT add it here

module.exports = router
