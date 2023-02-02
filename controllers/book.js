import asyncHandler from 'express-async-handler'
import mongoose from "mongoose"
import {Book, BookTag, BookCopy} from '../models/book.js'
import {Author} from '../models/author.js'
import {Publisher} from '../models/publisher.js'
import {Rating} from '../models/rating.js'

const getBooks = asyncHandler(async (req, res, next) => {
	if (req.query.filter) {
        req.books = await Book.find({tags: mongoose.Types.ObjectId(req.query.filter) });
	} else {
		req.books = await Book.find({ tags: { "$ne": mongoose.Types.ObjectId('6271e1b3be4587022f6803fb') }})
	}

	const authors = []
	for (var i = 0; i < req.books.length; i++) {
		authors[i] = await Author.findOne({ _id: req.books[i].author })
	}
	req.authors = authors

	next()
})

const getBookInfo = asyncHandler(async (req, res, next) =>{
	const { id } = req.query
	
	req.book = await Book.findOne({ _id: mongoose.Types.ObjectId(id) });
	req.author = await Author.findOne({ _id: req.book.author })
	req.publisher = await Publisher.findOne({ _id: req.book.publisher })
	
	req.tags = []
	for (var i = 0; i < req.book.tags.length; i++) {
		req.tags[i] = await BookTag.findOne({ _id: req.book.tags[i] })
	}
	
	if (req.user != null) {
		req.userRating = await Rating.findOne({user: req.user._id, book: req.book._id})
	}
	
	req.total = await BookCopy.find({ book: req.book._id }).count()
	req.current = await BookCopy.find({ book: req.book._id, status: false }).count()
	
	next();
})

const getTags = asyncHandler(async (req, res, next) =>{
	req.tags = await BookTag.find({})
	next()
})

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
	getBooks,
	getBookInfo,
	addBook,
	removeBook,
	getTags
}