// models/message.model.js
const { Schema, model } = require('mongoose')

const messageSchema = new Schema(
	{
		job: {
			type: Schema.Types.ObjectId,
			ref: 'Job',
			required: true,
		},
		sender: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		text: { type: String, required: true },
		isAI: { type: Boolean, default: false }, // Agar mijozga dastlab AI javob bersa
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

module.exports = model('Message', messageSchema)
