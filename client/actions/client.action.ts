'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const clientInputSchema = z.object({
	userId: z.string(),
	name: z.string(),
	email: z.string().email(),
	isCompany: z.boolean().default(false),
	company: z.string().optional(),
	kvk: z.string().optional(),
	btw: z.string().optional(),
	address: z.string().optional(),
})

export const getClientsAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/clients', {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const getClientAction = actionClient
	.schema(z.object({ userId: z.string(), clientId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get(`/api/clients/${parsedInput.clientId}`, {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const createClientAction = actionClient
	.schema(clientInputSchema)
	.action(async ({ parsedInput }) => {
		const { userId, ...body } = parsedInput
		const { data } = await axiosClient.post('/api/clients', body, {
			headers: { 'x-user-id': userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const updateClientAction = actionClient
	.schema(clientInputSchema.extend({ clientId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { userId, clientId, ...body } = parsedInput
		const { data } = await axiosClient.put(`/api/clients/${clientId}`, body, {
			headers: { 'x-user-id': userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const deleteClientAction = actionClient
	.schema(z.object({ userId: z.string(), clientId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.delete(`/api/clients/${parsedInput.clientId}`, {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})
