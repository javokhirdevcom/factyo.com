const router = require('express').Router()
const authController = require('../controllers/auth.controller')

router.post('/register', (req, res, next) => authController.register(req, res, next))
router.post('/login', (req, res, next) => authController.login(req, res, next))
router.post('/oauth-signin', (req, res, next) => authController.oauthSignin(req, res, next))
router.post('/verify-activate', (req, res, next) => authController.verifyActivate(req, res, next))

module.exports = router
