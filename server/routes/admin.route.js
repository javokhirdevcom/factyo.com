const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const { protectAdmin } = require('../middlewares/auth.middleware')

router.use(protectAdmin)

// Stats & analytics
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next))
router.get('/revenue', (req, res, next) => adminController.getRevenueData(req, res, next))
router.get('/payments', (req, res, next) => adminController.getPayments(req, res, next))

// User management
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next))
router.get('/users/:id', (req, res, next) => adminController.getUserDetail(req, res, next))
router.put('/users/:id/verify', (req, res, next) => adminController.verifyUser(req, res, next))
router.put('/users/:id/unverify', (req, res, next) => adminController.unverifyUser(req, res, next))
router.put('/users/:id/ban', (req, res, next) => adminController.banUser(req, res, next))
router.put('/users/:id/unban', (req, res, next) => adminController.unbanUser(req, res, next))
router.put('/users/:id/role', (req, res, next) => adminController.updateUserRole(req, res, next))
router.put('/users/:id/plan', (req, res, next) => adminController.updateUserPlan(req, res, next))
router.put('/users/:id/cancel-subscription', (req, res, next) => adminController.cancelUserSubscription(req, res, next))
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next))

// System settings
router.get('/settings', (req, res, next) => adminController.getSettings(req, res, next))
router.put('/settings', (req, res, next) => adminController.updateSettings(req, res, next))

module.exports = router
