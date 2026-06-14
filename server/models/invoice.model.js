const { Schema, model } = require('mongoose')

const invoiceSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
		invoiceNumber: { type: String, required: true },
		date: { type: String, required: true },
		dueDate: { type: String, required: true },
		items: [
			{
				description: { type: String },
				hours: { type: Number },
				hourlyRate: { type: Number },
				total: { type: Number },
			},
		],
		subtotal: { type: Number, default: 0 },
		vatRate: { type: Number, default: 21 },
		vatAmount: { type: Number, default: 0 },
		total: { type: Number, default: 0 },
		notes: { type: String, default: '' },
		status: { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
	},
	{ timestamps: true }
)

module.exports = model('Invoice', invoiceSchema)
