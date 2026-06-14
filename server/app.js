require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

app.use(
	cors({
		origin: process.env.CLIENT_URL || 'http://localhost:3000',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	}),
)

// Stripe webhook MUST receive raw body — register before express.json()
const stripeController = require('./controllers/stripe.controller')
app.post(
	'/api/stripe/webhook',
	express.raw({ type: 'application/json' }),
	(req, res, next) => stripeController.handleWebhook(req, res, next),
)

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use('/api', require('./routes/index'))

app.use(errorMiddleware)

const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 8080
		await mongoose.connect(process.env.MONGO_URI)
		console.log('Connected to MongoDB')
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`)
		})
	} catch (err) {
		console.error('Failed to connect to MongoDB', err)
		process.exit(1)
	}
}

bootstrap()
