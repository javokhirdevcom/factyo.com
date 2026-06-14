/** @type {import('next').NextConfig} */
const nextConfig = {
	allowedDevOrigins: ['172.20.10.2'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'utfs.io',
				// UploadThing official storage host engine
			},
		],
	},
}

module.exports = nextConfig
