const { Schema, model } = require('mongoose')

const systemConfigSchema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		value: { type: Schema.Types.Mixed, required: true },
	},
	{ timestamps: true },
)

const SystemConfig = model('SystemConfig', systemConfigSchema)

SystemConfig.getConfig = async () => {
	const docs = await SystemConfig.find({ key: { $in: ['otpEnabled', 'maintenanceMode'] } })
	const map = Object.fromEntries(docs.map(d => [d.key, d.value]))
	return {
		otpEnabled: map.otpEnabled !== undefined ? map.otpEnabled : true,
		maintenanceMode: map.maintenanceMode !== undefined ? map.maintenanceMode : false,
	}
}

SystemConfig.setValue = async (key, value) =>
	SystemConfig.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })

module.exports = SystemConfig
