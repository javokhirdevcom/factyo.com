const { Schema, model } = require('mongoose')

const clientSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true },
		email: { type: String, required: true },
		isCompany: { type: Boolean, default: false },
		company: { type: String, default: '' },
		kvk: { type: String, default: '' },
		btw: { type: String, default: '' },
		address: { type: String, default: '' },
	},
	{ timestamps: true }
)

module.exports = model('Client', clientSchema)
