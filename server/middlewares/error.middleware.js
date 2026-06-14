const BaseError = require('../errors/base.error')

function logError(err, req) {
	const timestamp = new Date().toISOString()
	const method = req?.method || 'UNKNOWN'
	const url = req?.originalUrl || req?.url || 'UNKNOWN'
	const status = err instanceof BaseError ? err.statusCode : 500

	console.error('─────────────────────────────────────────')
	console.error(`[ERROR] ${timestamp}`)
	console.error(`Route  : ${method} ${url}`)
	console.error(`Status : ${status}`)
	console.error(`Name   : ${err.name || 'Error'}`)
	console.error(`Message: ${err.message}`)
	if (err instanceof BaseError && err.errors?.length) {
		console.error('Errors :', JSON.stringify(err.errors, null, 2))
	}
	if (err.stack) {
		console.error('Stack  :\n' + err.stack)
	}
	console.error('─────────────────────────────────────────')
}

module.exports = function (err, req, res, next) {
	logError(err, req)

	if (err instanceof BaseError) {
		return res.status(err.statusCode).json({
			status: err.status,
			errors: err.errors,
		})
	}
	return res.status(500).json({
		message: err.message,
	})
}
