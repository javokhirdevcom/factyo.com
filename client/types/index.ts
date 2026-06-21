export interface ChildProps {
	children: React.ReactNode
}

export interface ReturnActionType {
	user?: IUser
	success?: boolean | string
	failure?: string
}

export interface IUser {
	_id: string
	email: string
	fullName: string
	role: string
	businessName?: string
	businessAddress?: string
	vatNumber?: string
	kvkNumber?: string
	phone?: string
	website?: string
	iban?: string
	bic?: string
	avatarUrl?: string
	logoUrl?: string
	invoiceSequence?: number
	plan: 'free' | 'basic' | 'unlimited'
	invoiceCount: number
	customerId?: string
	subscriptionId?: string
	createdAt?: string
}

export interface IClient {
	_id: string
	userId: string
	name: string
	email?: string
	isCompany?: boolean
	company?: string
	kvk?: string
	btw?: string
	address?: string
	createdAt?: string
}

export interface ILineItem {
	description: string
	hours: number
	hourlyRate: number
	total: number
}

export interface IInvoice {
	_id: string
	userId: string
	clientId: IClient | string
	invoiceNumber: string
	date: string
	dueDate: string
	items: ILineItem[]
	subtotal: number
	vatRate: number
	vatAmount: number
	total: number
	status: 'draft' | 'sent' | 'paid'
	notes?: string
	createdAt?: string
}
