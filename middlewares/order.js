import asyncHandler from 'express-async-handler'
import { Order } from '../models/order.js'
import { Book } from '../models/book.js'

const getBorrowing = asyncHandler(async (req, res, next) => {
	if (req.user == null) { next() }

	const order = await Order.findOne({ user: req.user._id })
	if (order) {
		req.borrowingBooks = []
		req.borrowingDate = []
		req.returningDate = []
		for (var i = 0; i < order.book.length; i++) {
			if (order.status[i]) {
				req.borrowingBooks.push(await Book.findOne({ _id: order.book[i] }))
				req.borrowingDate.push(order.borrowDate[i])
				req.returningDate.push(order.returnDate[i])
			}
		}
	}
	next()
})

const getBorrowed = asyncHandler(async (req, res, next) => {
	if (req.user == null) { next() }

	const order = await Order.findOne({ user: req.user._id })
	if (order) {
		req.borrowedBooks = []
		req.borrowedDate = []
		req.returnedDate = []
		for (var i = 0; i < order.book.length; i++) {
			if (!order.status[i]) {
				req.borrowedBooks.push(await Book.findOne({ _id: order.book[i] }))
				req.borrowedDate.push(order.borrowDate[i])
				req.returnedDate.push(order.returnDate[i])
			}
		}
	}
	next()
})

const getBorrowStatus = asyncHandler(async (req, res, next) => {
	if (req.user == null) { next() }

	const order = await Order.findOne({ user: req.user._id })
	if (order) {
		req.borrowing = false
		for (var i = 0; i < order.book.length; i++) {
			if (order.book[i].equals(req.book._id) && (order.status[i])) {
				req.borrowing = true
				break
			}
		}
	}
	next()
})

const removeOrder = asyncHandler(async (req, res, next) =>{
	try {
		const { total } = req.body
		for (var i = 0; i < total; i++) {
			await Order.deleteOne({_id: mongoose.Types.ObjectId(req.body[i]) })
		}

		next()
	} catch (err) {
		if (err.name == "ValidationError") {
			let errors = {};

			Object.keys(err.errors).forEach((key) => {
				errors[key] = err.errors[key].message;
			});
			return res.status(400).send(errors);
		}
		console.log(err)
		res.status(500).send("Something went wrong");
	}
})



export {
	getBorrowing,
	getBorrowed,
	getBorrowStatus,
	removeOrder
}