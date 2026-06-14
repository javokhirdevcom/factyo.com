const BaseError = require('../errors/base.error')

module.exports = function (err, req, res, next) {
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
