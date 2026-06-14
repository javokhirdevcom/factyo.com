'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

export const createCheckoutSessionAction = actionClient
	.schema(z.object({ userId: z.string(), plan: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post(
			'/api/stripe/create-checkout',
			{ plan: parsedInput.plan },
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})

export const getBillingPortalAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post(
			'/api/stripe/portal',
			{},
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})

export const cancelSubscriptionAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post(
			'/api/stripe/cancel',
			{},
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})
