const { Schema, model } = require('mongoose')

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		fullName: { type: String, required: true },
		password: { type: String }, // optional — OAuth users have no password
		provider: { type: String, default: 'credentials' },
		role: { type: String, default: 'user' },

		businessName: { type: String, default: '' },
		businessAddress: { type: String, default: '' },
		vatNumber: { type: String, default: '' },
		kvkNumber: { type: String, default: '' },
		phone: { type: String, default: '' },
		website: { type: String, default: '' },
		iban: { type: String, default: '' },
		bic: { type: String, default: '' },

		avatarUrl: { type: String, default: '' },
		logoUrl: { type: String, default: '' },

		invoiceSequence: { type: Number, default: 0 },
		plan: { type: String, enum: ['free', 'basic', 'unlimited'], default: 'free' },
		invoiceCount: { type: Number, default: 0 },
		customerId: { type: String, default: '' },
		subscriptionId: { type: String, default: '' },

		isVerified: { type: Boolean, default: false },
		isDeleted: { type: Boolean, default: false },
		deletedAt: { type: Date },
	},
	{ timestamps: true }
)

module.exports = model('User', userSchema)
