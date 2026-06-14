// server/services/ai.service.js
const { OpenAI } = require('openai')

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Mijoz yozgan tavsif va kategoriyaga qarab professional Gollandiya smetasini chiqarish
 */
// server/services/ai.service.js

async function calculateSmartEstimate(category, description, clientBudget) {
	try {
		const prompt = `
      Je bent een professionele calculator voor een bouwbedrijf genaamd 'Oynur Bouw' in Nederland.
      Analyseer de volgende klusaanvraag:
      Categorie: ${category}
      Omschrijving: ${description}
      Budget van de klant: €${clientBudget || 'Niet gespecificeerd'}

      Bereken de totale kosten op basis van de huidige Nederlandse marktprijzen (inclusief btw).
      Splits de kosten strikt op in materiaalkosten en arbeidskosten (service fee).
      Maak een lijst van benodigde materialen met hun geschatte marktprijs.

      GEEF STRIKT ENLEEN JSON TERUG IN HET VOLGENDE FORMAAT:
      {
        "finalPrice": 1250,
        "materiaalkosten": 450,
        "arbeidskosten": 800,
        "estimatedDuration": "2-3 working days",
        "technicalAnalysis": "Korte technische samenvatting in het Nederlands...",
        "materialListWithPrices": [
          {"name": "Gipsplaten 12.5mm (per m2)", "price": 120},
          {"name": "Voorstrijk (5L)", "price": 45},
          {"name": "Gipsplaatschroeven (doos)", "price": 25}
        ]
      }
    `

		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are a professional Dutch construction cost estimator outputting strict JSON.',
				},
				{ role: 'user', content: prompt },
			],
			response_format: { type: 'json_object' },
		})

		const result = JSON.parse(response.choices[0].message.content)
		return result
	} catch (error) {
		console.error('AI Estimation Error:', error)
		// Xatolik bo'lsa fallback ma'lumotlar
		return {
			finalPrice: Number(clientBudget) || 1000,
			materiaalkosten: Math.round((Number(clientBudget) || 1000) * 0.35),
			arbeidskosten: Math.round((Number(clientBudget) || 1000) * 0.65),
			estimatedDuration: 'In overleg',
			technicalAnalysis: 'We komen langs voor een exacte opname.',
			materialListWithPrices: [
				{
					name: 'Bouwmaterialen (indicatief)',
					price: Math.round((Number(clientBudget) || 1000) * 0.35),
				},
			],
		}
	}
}

/**
 * Chizmadagi planni tahlil qilish (Vision API)
 */
async function analyzeProjectPlan(imageUrl) {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o', // Rasm tahlili uchun to'liq gpt-4o kerak
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: "Ushbu qurilish chizmasini (planni) tahlil qil. Xonalar soni, devorlar o'lchami va muhandislik nuqtai nazaridan nimalarga e'tibor berish kerakligini qisqacha Golland yoki Ingliz tilida punktma-punkt yozib ber.",
						},
						{ type: 'image_url', image_url: { url: imageUrl } },
					],
				},
			],
		})
		return response.choices[0].message.content
	} catch (error) {
		console.error('AI Vision Error:', error)
		return 'Chizmani tahlil qilishda xatolik yuz berdi.'
	}
}

/**
 * Remont qilingan tayyor xona ko'rinishini generatsiya qilish (DALL-E 3)
 */
// server/services/ai.service.js

/**
 * Remont qilingan tayyor xona ko'rinishini generatsiya qilish (DALL-E 2 ga moslashtirildi)
 */
// server/services/ai.service.js

async function generateRoomVisualization(category, description) {
	try {
		const prompt = `Modern minimalist newly renovated room in the Netherlands, ${category}, ${description}, photorealistic 8k resolution interior design.`

		const response = await openai.images.generate({
			model: 'dall-e-2',
			prompt: prompt,
			n: 1,
			size: '512x512',
		})

		return response.data[0].url
	} catch (error) {
		console.log(
			'⚠️ OpenAI Image Generation yopiq ekan. Zaxira rasm ishlatiladi.',
		)

		// OpenAI xato bersa, loyiha to'xtab qolmasligi uchun darhol chiroyli zaxira rasmini qaytaramiz
		return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1024&auto=format&fit=crop'
	}
}

module.exports = {
	calculateSmartEstimate,
	analyzeProjectPlan,
	generateRoomVisualization,
}
