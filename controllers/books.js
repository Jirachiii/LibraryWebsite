import asyncHandler from 'express-async-handler'
import mongoose from "mongoose"

const Book = require('../models/book.js')

const addBook = asyncHandler(async (req, res, next) =>{
	try {
		const { total } = req.body

		for (var i = 0; i < total; i++) {
			if (await Book.findOne({name: req.body['bookname' + i], author: mongoose.Types.ObjectId(req.body['author' + i])})){
				return res.status(400).send('Book already existed');
			}
			const bookTagsArray = req.body['bookTag' + i].split(',').map(id => mongoose.Types.ObjectId(id));

			await Book.create({
				name: req.body['bookname' + i],
				author: mongoose.Types.ObjectId(req.body['author' + i]),
				publisher: req.body['publisher' + i],
				language: req.body['language' + i],
				page: req.body['page' + i],
				description: req.body['description' + i],
				image: req.body['image' + i],
				bookTag: bookTagsArray,
				rating: req.body['rating' + i],
				timesBorrowed: req.body['timesBorrowed' + i],
			})
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

const removeBook = asyncHandler(async (req, res, next) =>{
	try {
		const { total } = req.body
		for (var i = 0; i < total; i++) {
			await Book.deleteOne({_id: mongoose.Types.ObjectId(req.body[i]) })
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
	addBook,
	removeBook
}