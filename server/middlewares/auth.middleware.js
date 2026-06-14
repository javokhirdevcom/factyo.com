const userModel = require('../models/user.model')

const protectAdmin = async (req, res, next) => {
	try {
		const userId = req.headers['x-user-id'] || req.headers['authorization']

		if (!userId) {
			return res
				.status(401)
				.json({ failure: "Sessiya topilmadi. Avtorizatsiyadan o'ting!" })
		}

		const user = await userModel.findById(userId)
		if (!user) {
			return res.status(404).json({ failure: 'Foydalanuvchi topilmadi' })
		}

		if (user.role !== 'admin') {
			return res
				.status(403)
				.json({ failure: 'Tizimga kirish taqiqlangan: Siz admin emassiz!' })
		}

		req.user = user
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = { protectAdmin }
