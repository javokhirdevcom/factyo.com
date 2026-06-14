const router = require('express').Router()
const userController = require('../controllers/user.controller')

router.get('/profile/:id', (req, res, next) => userController.getUserProfile(req, res, next))
router.put('/profile', (req, res, next) => userController.updateProfile(req, res, next))
router.post('/change-password', (req, res, next) => userController.changePassword(req, res, next))
router.get('/products', (req, res, next) => userController.getProducts(req, res, next))

module.exports = router
