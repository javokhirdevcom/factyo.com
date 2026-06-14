// routes/message.route.js
const router = require('express').Router()
const Message = require('../models/message.model')

// 1. Ma'lum bir ish (Job)ga tegishli barcha eski xabarlarni olish
router.get('/:jobId', async (req, res, next) => {
	try {
		const { jobId } = req.params
		const messages = await Message.find({ job: jobId }).sort({ createdAt: 1 }) // Eskidan yangiga qarab tartiblash
		res.status(200).json({ success: true, messages })
	} catch (err) {
		next(err)
	}
})

// 2. HTTP orqali ham xabarni bazaga saqlash endpointi
router.post('/save', async (req, res, next) => {
	try {
		const { job, sender, text, isAI } = req.body
		const newMessage = new Message({ job, sender, text, isAI })
		await newMessage.save()
		res.status(201).json({ success: true, message: newMessage })
	} catch (err) {
		next(err)
	}
})

module.exports = router
