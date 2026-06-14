const { Schema, model } = require('mongoose')

const reviewSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true },
		projectType: { type: String, placeholder: 'Zolder stucadoren, Elektra...' },
	},
	{ timestamps: true },
)

module.exports = model('Review', reviewSchema)
