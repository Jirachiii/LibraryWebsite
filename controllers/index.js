import asyncHandler from 'express-async-handler';
import { Book } from '../models/book.js'
import { Author } from '../models/author.js'
import { Publisher } from "../models/publisher.js"
import { Coupon } from '../models/coupon.js'
import { Subscription } from '../models/subscription.js'
import mongoose from "mongoose";


const getCoupons = asyncHandler(async (req, res, next) => {
    try {
        req.coupons = await Coupon.find({}).limit(5);
    } catch (err) {
        req.coupons = await Coupon.find({});
    }
    next();
})

const getSubscriptions = asyncHandler(async (req, res, next) => {
    try {
        req.subscriptions = await Subscription.find({}).limit(5);
    } catch (err) {
        req.subscriptions = await Subscription.find({});
    }
    next();
})

const getBestBooks = asyncHandler(async (req, res, next) =>{
    try {
        req.bestBooks = await Book.find({}).limit(5);
    } catch (err) {
        req.bestBooks = await Book.find({});
    }

    const authors = []
    for (var i = 0; i < req.bestBooks.length; i++) {
        authors[i] = await Author.findOne({ _id: req.bestBooks[i].author })
    }
    req.bestBooksAuthors = authors

    next();
})

const getBestAuthors = asyncHandler(async (req, res, next) =>{
    try {
        req.bestAuthors = await Author.find({}).limit(5);
    } catch (err) {
        req.bestAuthors = await Author.find({});
    }
    next()
})

const addCoupon = asyncHandler(async (req, res, next) =>{
    try {
        const { total } = req.body

        for (var i = 0; i < total; i++) {
            if (await Coupon.findOne({name: req.body['name' + i]})){
                return res.status(400).send('Coupon already existed');
            }

            await Coupon.create({
                name: req.body['name' + i],
                owner: req.body['owner' + i],
                bookAmountIncrease: req.body['bookAmountIncrease' + i],
                regisPriceDecrease: req.body['regisPriceDecrease' + i],
                startDate: Date.parse(req.body['startDate' + i]),
                endDate: Date.parse(req.body['endDate' + i]),
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

const removeCoupon = asyncHandler(async (req, res, next) =>{
    try {
        const { total } = req.body
        for (var i = 0; i < total; i++) {
            await CouremoveCoupon.deleteOne({_id: mongoose.Types.ObjectId(req.body[i]) })
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

const addSubscription = asyncHandler(async (req, res, next) =>{
    try {
        const { total } = req.body

        for (var i = 0; i < total; i++) {
            if (await Subscription.findOne({name: req.body['name' + i], type: req.body['type' + i]})) {
                return res.status(400).send('Subscription already existed');
            }

            await Subscription.create({
                name: req.body['name' + i],
                type: req.body['type' + i],
                price: req.body['price' + i],
                borrowAmount: req.body['borrowAmount' + i],
                borrowDuration: Date.parse(req.body['borrowDuration' + i])
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

const removeSubscription = asyncHandler(async (req, res, next) =>{
    try {
        const { total } = req.body
        for (var i = 0; i < total; i++) {
            await Subscription.deleteOne({_id: mongoose.Types.ObjectId(req.body[i]) })
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

const search = asyncHandler(async (req, res, next) => {
    try{
        let {searchQuery,searchMode} = req.query;

        if (searchQuery||searchMode){
            let result;
            switch (searchMode) {
                case 'authors':
                    const author = await Author.findOne({name: { "$regex": searchQuery, "$options": "i" }})
                    if (req.user == null || req.user.type != 'admin') {
                        result = await Book.find({
                            author: author._id, 
                            tags: { "$ne": mongoose.Types.ObjectId('6271e1b3be4587022f6803fb') }
                        });
                    } else {
                        result = await Book.find({author: author._id});
                    }
                    break
                case 'books':
                    if (req.user == null || req.user.type != 'admin') {
                        result = await Book.find({
                            name: { "$regex": searchQuery, "$options": "i" }, 
                            tags: { "$ne": mongoose.Types.ObjectId('6271e1b3be4587022f6803fb') }
                        });
                    } else {
                        result = await Book.find({name: { "$regex": searchQuery, "$options": "i" }})
                    }
                    break
                case 'publishers':
                    const publisher = await Publisher.findOne({name: { "$regex": searchQuery, "$options": "i" }})
                    if (req.user == null || req.user.type != 'admin') {
                        result = await Book.find({
                            publisher: publisher._id, 
                            tags: { "$ne": mongoose.Types.ObjectId('6271e1b3be4587022f6803fb') }
                        });
                    } else {
                        result = await Book.find({publisher: publisher._id});
                    }
                    break
            }

            req.books = result
    
            const authors = []
            for (var i = 0; i < req.books.length; i++) {
                authors[i] = await Author.findOne({ _id: req.books[i].author })
            }
            req.authors = authors

            next()
        }else{
            res.status(400).send('Missing queries')
        }
    }catch (err) {
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
    getBestBooks,
    getBestAuthors,
    getCoupons,
    getSubscriptions,
    addCoupon,
    removeCoupon,
    addSubscription,
    removeSubscription,
    search
}