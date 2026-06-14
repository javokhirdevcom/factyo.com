const { Schema, model } = require('mongoose')

const serviceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['badkamers', 'gipsplaten', 'schilderwerk', 'elektra', 'zonnepanelen', 'renovatie'],
      required: true,
    },
    features: [{ type: String }],
    process: [
      {
        step: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    coverImage: { type: String },
    gallery: [{ type: String }],
    startingPrice: { type: Number },
    priceUnit: { type: String, default: 'per project' },
    estimatedDuration: { type: String },
    isVCARequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = model('Service', serviceSchema)
