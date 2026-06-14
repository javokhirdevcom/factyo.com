const router = require('express').Router()
const clientController = require('../controllers/client.controller')

router.get('/', (req, res, next) => clientController.getClients(req, res, next))
router.get('/:id', (req, res, next) => clientController.getClient(req, res, next))
router.post('/', (req, res, next) => clientController.createClient(req, res, next))
router.put('/:id', (req, res, next) => clientController.updateClient(req, res, next))
router.delete('/:id', (req, res, next) => clientController.deleteClient(req, res, next))

module.exports = router
