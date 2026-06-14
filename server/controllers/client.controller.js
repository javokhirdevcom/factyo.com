const Client = require('../models/client.model')

class ClientController {
	async getClients(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const clients = await Client.find({ userId }).sort({ createdAt: -1 })
			return res.json({ success: true, clients })
		} catch (err) {
			next(err)
		}
	}

	async getClient(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const client = await Client.findOne({ _id: req.params.id, userId })
			if (!client) return res.json({ failure: 'Client not found' })
			return res.json({ success: true, client })
		} catch (err) {
			next(err)
		}
	}

	async createClient(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const { name, email, isCompany, company, kvk, btw, address } = req.body
			if (!name || !email) return res.json({ failure: 'Name and email are required.' })

			const client = await Client.create({ userId, name, email, isCompany, company, kvk, btw, address })
			return res.json({ success: true, client })
		} catch (err) {
			next(err)
		}
	}

	async updateClient(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const { name, email, isCompany, company, kvk, btw, address } = req.body
			const client = await Client.findOneAndUpdate(
				{ _id: req.params.id, userId },
				{ name, email, isCompany, company, kvk, btw, address },
				{ new: true }
			)
			if (!client) return res.json({ failure: 'Client not found' })
			return res.json({ success: true, client })
		} catch (err) {
			next(err)
		}
	}

	async deleteClient(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const client = await Client.findOneAndDelete({ _id: req.params.id, userId })
			if (!client) return res.json({ failure: 'Client not found' })
			return res.json({ success: true })
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new ClientController()
