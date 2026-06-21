const Client = require('../models/client.model')

class ClientController {
	async getClients(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const clients = await Client.find({ userId }).sort({ createdAt: -1 })
			return res.json({ success: true, clients })
		} catch (err) {
			console.error('[client] getClients error:', err.message)
			return res.json({ failure: err.message || 'Failed to load clients.' })
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
			console.error('[client] getClient error:', err.message)
			return res.json({ failure: err.message || 'Failed to load client.' })
		}
	}

	async createClient(req, res, next) {
		try {
			const userId = req.headers['x-user-id']
			if (!userId) return res.status(401).json({ failure: 'Unauthorized' })

			const { name, email, isCompany, company, kvk, btw, address } = req.body
			if (!name) return res.json({ failure: 'Client name is required.' })

			const client = await Client.create({ userId, name, email, isCompany, company, kvk, btw, address })
			return res.json({ success: true, client })
		} catch (err) {
			console.error('[client] createClient error:', err.message)
			return res.json({ failure: err.message || 'Failed to create client.' })
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
			console.error('[client] updateClient error:', err.message)
			return res.json({ failure: err.message || 'Failed to update client.' })
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
			console.error('[client] deleteClient error:', err.message)
			return res.json({ failure: err.message || 'Failed to delete client.' })
		}
	}
}

module.exports = new ClientController()
