const router = require('express').Router()
const Job = require('../models/job.model')
const aiService = require('../services/ai.service')

// 1. Yangi loyiha yaratish (AI hisob-kitoblari bilan)
router.post('/create', async (req, res, next) => {
	try {
		const {
			title,
			description,
			category,
			preferredDate,
			clientBudget,
			address,
			planImageUrl,
		} = req.body
		const userId = req.headers['x-user-id']

		if (!userId)
			return res
				.status(400)
				.json({ success: false, failure: 'User ID topilmadi' })

		// OpenAI orqali aqlli narx va materiallar ro'yxatini hisoblaymiz
		const aiEstimation = await aiService.calculateSmartEstimate(
			category,
			description,
			clientBudget,
		)

		// Agar mijoz chizma yuklagan bo'lsa - uni tahlil qilamiz
		let planAnalysis = ''
		if (planImageUrl) {
			planAnalysis = await aiService.analyzeProjectPlan(planImageUrl)
		}

		// Xonaning vizualizatsiyasini generatsiya qilish
		const aiVisualUrl = await aiService.generateRoomVisualization(
			category,
			description,
		)

		// server/routes/job.route.js ichidagi /create qismi:

		// server/routes/job.route.js ichidagi /create qismi:

		const newJob = new Job({
			client: userId,
			title,
			description,
			category,
			preferredDate,
			clientBudget,
			address,
			finalPrice: aiEstimation.finalPrice,
			materiaalkosten: aiEstimation.materiaalkosten,
			arbeidskosten: aiEstimation.arbeidskosten,
			estimatedDuration: aiEstimation.estimatedDuration,
			technicalAnalysis: aiEstimation.technicalAnalysis,

			// KAFOLATLASH: Agar AI massivni boshqacha nomlasa ham xato bermasligi uchun
			materialListWithPrices:
				aiEstimation.materialListWithPrices || aiEstimation.materials || [],

			aiVisualizationUrl: aiVisualUrl,
			planAnalysisText: planAnalysis,
		})

		await newJob.save()
		res.status(201).json({ success: true, job: newJob })
	} catch (err) {
		next(err)
	}
})

// 2. Mijoz o'ziga tegishli barcha ishlarni ko'rishi
router.get('/my-jobs', async (req, res, next) => {
	try {
		const userId = req.headers['x-user-id']
		const jobs = await Job.find({ client: userId }).sort({ createdAt: -1 })
		res.status(200).json({ success: true, jobs })
	} catch (err) {
		next(err)
	}
})

// 3. ID bo'yicha aynan bitta loyihani to'liq olish (Frontend "Loyiha topilmadi" xatosini yo'qotadi)
router.get('/:id', async (req, res, next) => {
	try {
		const job = await Job.findById(req.params.id)
		if (!job) {
			return res
				.status(404)
				.json({ success: false, failure: 'Loyiha topilmadi' })
		}
		res.status(200).json({ success: true, job })
	} catch (err) {
		next(err)
	}
})

module.exports = router
