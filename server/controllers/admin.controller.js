const productModel = require('../models/product.model')
const userModel = require('../models/user.model')
const orderModel = require('../models/order.model')
const transactionModel = require('../models/transaction.model')

class AdminController {
	// [GET] /admin/products
	async getProducts(req, res, next) {
		try {
			const products = await productModel.find()
			return res.json({ success: 'Products retrieved successfully', products })
		} catch (error) {
			next(error)
		}
	}

	// [GET] /admin/customers
	async getCustomers(req, res, next) {
		try {
			const customers = await userModel.find({ role: 'user' })
			return res.json({
				success: 'Customers retrieved successfully',
				customers,
			})
		} catch (error) {
			next(error)
		}
	}

	// [GET] /admin/orders
	async getOrders(req, res, next) {
		try {
			const orders = await orderModel.find()
			return res.json({ success: 'Orders retrieved successfully', orders })
		} catch (error) {
			next(error)
		}
	}

	// [GET] /admin/transactions
	async getTransactions(req, res, next) {
		try {
			const transactions = await transactionModel.find()
			return res.json({
				success: 'Transactions retrieved successfully',
				transactions,
			})
		} catch (error) {
			next(error)
		}
	}

	// [POST] /admin/create-product
	async createProduct(req, res, next) {
		try {
			const newProduct = await productModel.create(req.body)
			if (!newProduct) {
				return res.json({ failure: 'Failed to create product' })
			}
			return res.json({
				success: 'Product created successfully',
				product: newProduct,
			})
		} catch (error) {
			next(error)
		}
	}

	// [PUT] /admin/update-product/:id
	async updateProduct(req, res, next) {
		try {
			const { id } = req.params
			const updatedProduct = await productModel.findByIdAndUpdate(
				id,
				req.body,
				{ returnDocument: 'after' }, // Mongoose deprecation xatosini oldini olish uchun
			)
			if (!updatedProduct) {
				return res.json({ failure: 'Failed to update product' })
			}
			return res.json({
				success: 'Product updated successfully',
				product: updatedProduct,
			})
		} catch (error) {
			next(error)
		}
	}

	// [PUT] /admin/update-order/:id
	async updateOrder(req, res, next) {
		try {
			const { id } = req.params
			const { status } = req.body
			const updatedOrder = await orderModel.findByIdAndUpdate(
				id,
				{ status },
				{ returnDocument: 'after' },
			)
			if (!updatedOrder) {
				return res.json({ failure: 'Failed to update order' })
			}
			return res.json({
				success: 'Order updated successfully',
				order: updatedOrder,
			})
		} catch (error) {
			next(error)
		}
	}

	// [DELETE] /admin/delete-product/:id
	async deleteProduct(req, res, next) {
		try {
			const { id } = req.params
			const deletedProduct = await productModel.findByIdAndDelete(id)
			if (!deletedProduct) {
				return res.json({ failure: 'Failed to delete product' })
			}
			return res.json({
				success: 'Product deleted successfully',
				product: deletedProduct,
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = new AdminController()
