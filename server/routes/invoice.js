const router = require('express').Router()
const invoiceController = require('../controllers/invoice.controller')

router.get('/', (req, res, next) => invoiceController.getInvoices(req, res, next))
router.get('/:id', (req, res, next) => invoiceController.getInvoice(req, res, next))
router.post('/', (req, res, next) => invoiceController.createInvoice(req, res, next))
router.put('/:id', (req, res, next) => invoiceController.updateInvoice(req, res, next))
router.delete('/:id', (req, res, next) => invoiceController.deleteInvoice(req, res, next))
router.post('/:id/send', (req, res, next) => invoiceController.sendInvoice(req, res, next))

module.exports = router
