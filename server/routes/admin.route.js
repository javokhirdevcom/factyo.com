const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const { protectAdmin } = require('../middlewares/auth.middleware')

router.use(protectAdmin)

router.get('/stats', (req, res, next) => adminController.getStats(req, res, next))
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next))
router.put('/users/:id/verify', (req, res, next) => adminController.verifyUser(req, res, next))
router.put('/users/:id/unverify', (req, res, next) => adminController.unverifyUser(req, res, next))
router.put('/users/:id/role', (req, res, next) => adminController.updateUserRole(req, res, next))
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next))
router.get('/settings', (req, res, next) => adminController.getSettings(req, res, next))
router.put('/settings', (req, res, next) => adminController.updateSettings(req, res, next))

module.exports = router
