import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/dashboard/', '/admin/', '/api/', '/payment-success'],
			},
		],
		sitemap: 'https://www.factyo.com/sitemap.xml',
		host: 'https://www.factyo.com',
	}
}
