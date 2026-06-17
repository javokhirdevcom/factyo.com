require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// CORS sozlamalarini production uchun kuchaytiramiz
const allowedOrigins = [
	process.env.CLIENT_URL,
	'https://www.factyo.com',
	'https://factyo.com',
	'http://localhost:3000',
].filter(Boolean)

app.use(
	cors({
		origin: function (origin, callback) {
			// Brauzerdan tashqari (masalan Postman) yoki ruxsat berilgan saytlar uchun
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
		optionsSuccessStatus: 200, // Ba'zi eski brauzerlar (Safari/Edge) qotib qolmasligi uchun
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

// Barcha API routerlar
app.use('/api', require('./routes/index'))

app.use(errorMiddleware)

const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 8080
		// Default fallback sifatida localhost mongo ulanishini to'g'rilab qo'ydim
		await mongoose.connect(
			process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/factyo',
		)
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
