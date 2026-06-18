require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

// Railway / Vercel sit behind a reverse proxy — trust the first hop so
// express-rate-limit reads the real client IP from X-Forwarded-For
app.set('trust proxy', 1)

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
	process.env.CLIENT_URL,
	'https://www.factyo.com',
	'https://factyo.com',
	'http://localhost:3000',
].filter(Boolean)

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
		optionsSuccessStatus: 200,
	}),
)

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: { failure: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { failure: 'Too many login attempts. Please wait 15 minutes.' },
})

const otpLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { failure: 'Too many OTP requests. Please wait 10 minutes.' },
})

app.use(globalLimiter)
app.use('/api/auth', authLimiter)
app.use('/api/otp', otpLimiter)

// ─── Stripe webhook MUST receive raw body — register before express.json() ───
const stripeController = require('./controllers/stripe.controller')
app.post(
	'/api/stripe/webhook',
	express.raw({ type: 'application/json' }),
	(req, res, next) => stripeController.handleWebhook(req, res, next),
)

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

// ─── NoSQL injection prevention ───────────────────────────────────────────────
app.use(mongoSanitize())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/index'))

app.use(errorMiddleware)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 8080
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
