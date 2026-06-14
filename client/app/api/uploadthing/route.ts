// app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from './core'

// Force Next.js to always treat this API route as dynamic (Prevents build-time caching errors)
export const dynamic = 'force-dynamic'

export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
})
