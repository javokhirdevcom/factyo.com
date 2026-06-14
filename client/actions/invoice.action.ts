'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const lineItemSchema = z.object({
	description: z.string(),
	hours: z.number(),
	hourlyRate: z.number(),
	total: z.number(),
})

const invoiceInputSchema = z.object({
	userId: z.string(),
	clientId: z.string(),
	invoiceNumber: z.string(),
	date: z.string(),
	dueDate: z.string(),
	items: z.array(lineItemSchema),
	vatRate: z.number(),
	notes: z.string().optional(),
	subtotal: z.number(),
	vatAmount: z.number(),
	total: z.number(),
})

export const getInvoicesAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/invoices', {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const getInvoiceAction = actionClient
	.schema(z.object({ userId: z.string(), invoiceId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get(`/api/invoices/${parsedInput.invoiceId}`, {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const createInvoiceAction = actionClient
	.schema(invoiceInputSchema)
	.action(async ({ parsedInput }) => {
		const { userId, ...body } = parsedInput
		const { data } = await axiosClient.post('/api/invoices', body, {
			headers: { 'x-user-id': userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const updateInvoiceStatusAction = actionClient
	.schema(z.object({ userId: z.string(), invoiceId: z.string(), status: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/invoices/${parsedInput.invoiceId}`,
			{ status: parsedInput.status },
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateInvoiceAction = actionClient
	.schema(invoiceInputSchema.extend({ invoiceId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { userId, invoiceId, ...body } = parsedInput
		const { data } = await axiosClient.put(`/api/invoices/${invoiceId}`, body, {
			headers: { 'x-user-id': userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const deleteInvoiceAction = actionClient
	.schema(z.object({ userId: z.string(), invoiceId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.delete(`/api/invoices/${parsedInput.invoiceId}`, {
			headers: { 'x-user-id': parsedInput.userId },
		})
		return JSON.parse(JSON.stringify(data))
	})

export const sendInvoiceAction = actionClient
	.schema(z.object({ userId: z.string(), invoiceId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post(
			`/api/invoices/${parsedInput.invoiceId}/send`,
			{},
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})
