const router = require('express').Router()
const serviceController = require('../controllers/service.controller')

router.get('/', (req, res, next) => serviceController.getAll(req, res, next))
router.get('/:slug', (req, res, next) => serviceController.getBySlug(req, res, next))

module.exports = router
