import { z } from 'zod'

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(6, 'Confirm password is required'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

export const clientSchema = z.object({
	name: z.string().min(1, 'Client name is required'),
	email: z.string().email('Valid email is required'),
	isCompany: z.boolean().default(false),
	company: z.string().optional(),
	kvk: z.string().optional(),
	btw: z.string().optional(),
	address: z.string().optional(),
})

const lineItemSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	hours: z.coerce.number().min(0, 'Hours must be 0 or more'),
	hourlyRate: z.coerce.number().min(0, 'Rate must be 0 or more'),
	total: z.coerce.number().min(0),
})

export const invoiceSchema = z.object({
	clientId: z.string().min(1, 'Select a client'),
	invoiceNumber: z.string().min(1, 'Invoice number is required'),
	date: z.string().min(1, 'Date is required'),
	dueDate: z.string().min(1, 'Due date is required'),
	items: z.array(lineItemSchema).min(1, 'Add at least one line item'),
	vatRate: z.coerce.number().refine(v => [0, 9, 21].includes(v), { message: 'VAT must be 0%, 9%, or 21%' }),
	notes: z.string().optional(),
})

export const profileSchema = z.object({
	fullName: z.string().min(2, 'Name must be at least 2 characters'),
	businessName: z.string().optional(),
	businessAddress: z.string().optional(),
	vatNumber: z.string().optional(),
	kvkNumber: z.string().optional(),
	phone: z.string().optional(),
	website: z.string().optional(),
	iban: z.string().optional(),
	bic: z.string().optional(),
})
