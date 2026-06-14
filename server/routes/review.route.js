const router = require('express').Router()
const Review = require('../models/review.model')

// Landing page uchun eng yaxshi sharhlarni olish (4-5 yulduzli)
router.get('/featured', async (req, res, next) => {
	try {
		const reviews = await Review.find({ rating: { $gte: 4 } })
			.limit(6)
			.sort({ createdAt: -1 })
		res.status(200).json({ success: true, reviews })
	} catch (err) {
		next(err)
	}
})

// Yangi sharh qoldirish
router.post('/add', async (req, res, next) => {
	try {
		const { name, rating, comment, projectType, userId } = req.body
		const newReview = new Review({
			user: userId,
			name,
			rating,
			comment,
			projectType,
		})
		await newReview.save()
		res.status(201).json({ success: true, review: newReview })
	} catch (err) {
		next(err)
	}
})

module.exports = router
