const router = require('express').Router()
const adminController = require('../controllers/admin.controller')

// TO'G'RILANDI: Middleware ob'ekt ichidan sug'urib olindi va xavfsizlik ta'minlandi
const { protectAdmin } = require('../middlewares/auth.middleware')

// Barcha GET so'rovlar himoyalandi
router.get('/products', protectAdmin, adminController.getProducts)
router.get('/customers', protectAdmin, adminController.getCustomers)
router.get('/orders', protectAdmin, adminController.getOrders)
router.get('/transactions', protectAdmin, adminController.getTransactions)

// Mahsulot yaratish (POST) himoyalandi
router.post('/create-product', protectAdmin, adminController.createProduct)

// Tahrirlash (PUT) so'rovlari himoyalandi
router.put('/update-product/:id', protectAdmin, adminController.updateProduct)
router.put('/update-order/:id', protectAdmin, adminController.updateOrder)

// O'chirish (DELETE) so'rovi himoyalandi
router.delete(
	'/delete-product/:id',
	protectAdmin,
	adminController.deleteProduct,
)

module.exports = router
