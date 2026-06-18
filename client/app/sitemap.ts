import { MetadataRoute } from 'next'

const BASE = 'https://www.factyo.com'

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date()

	const staticPages: MetadataRoute.Sitemap = [
		{ url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
		{ url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
		{ url: `${BASE}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${BASE}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
		{ url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${BASE}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
	]

	return staticPages
}
