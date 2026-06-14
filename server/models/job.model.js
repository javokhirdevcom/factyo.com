// models/job.model.js
const { Schema, model } = require('mongoose')

const jobSchema = new Schema(
	{
		client: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: { type: String, required: true }, // Masalan: "Zolder stukadoren" (Chordoqni suvoq qilish)
		description: { type: String, required: true },
		category: {
			type: String,
			enum: [
				'plasterboard',
				'electrical',
				'painting',
				'solar-panels',
				'renovation',
				'other',
			],
			required: true,
		},
		images: [{ type: String }], // utfs.io (UploadThing) dan keladigan rasmlar linki

		// Mijoz xohlayotgan vaqt va taklif qilayotgan narxi
		preferredDate: { type: Date, required: true },
		clientBudget: { type: Number }, // Agar mijoz o'z budjetini kiritsa

		// Biz (Oynur Bouw) va AI tomonidan hisoblangan yakuniy taklif
		finalPrice: { type: Number, default: 0 },
		estimatedDuration: { type: String }, // Masalan: "2 days"

		// Ish holati
		status: {
			type: String,
			enum: [
				'pending_ai',
				'pending_approval',
				'deposit_pending',
				'scheduled',
				'in_progress',
				'completed',
				'cancelled',
			],
			default: 'pending_ai',
		},

		// To'langan depozit va tranzaksiya bog'liqligi
		depositPaid: { type: Boolean, default: false },
		depositTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },

		address: {
			street: { type: String, required: true },
			postcode: { type: String, required: true }, // NL postcodelari (masalan: 3011 WX)
			city: { type: String, required: true },
		},

		// server/models/job.model.js ichiga qo'shiladigan yangi maydonlar:
		materialList: [{ type: String }],
		technicalAnalysis: { type: String },
		aiVisualizationUrl: { type: String },
		planAnalysisText: { type: String },
		// server/models/job.model.js ichida:

		// Eski materialList: [String] o'rniga mana buni qo'ying:
		materialListWithPrices: [
			{
				name: { type: String, required: true },
				price: { type: Number, required: true },
			},
		],
		materiaalkosten: { type: Number },
		arbeidskosten: { type: Number },
	},
	{ timestamps: true },
)

module.exports = model('Job', jobSchema)
