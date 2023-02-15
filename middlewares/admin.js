import asyncHandler from 'express-async-handler'
import mongoose from "mongoose"
import {Author} from '../models/author.js'
import {Book} from '../models/book.js'
import {Order} from '../models/order.js'
import {Publisher} from '../models/publisher.js'
import {Coupon} from '../models/coupon.js'
import {User} from '../models/user.js'
import {Subscription} from '../models/subscription.js'

const getDatabase = asyncHandler(async (req, res, next) => {
    req.orders = await Order.find({})
    req.books = await Book.find({})
    req.authors = await Author.find({})
    req.publishers = await Publisher.find({})
    req.coupons = await Coupon.find({})
    req.subscriptions = await Subscription.find({})
    req.readers = await User.find({ type: 'normal' })
    req.staff = await User.find({ type: {"$ne": 'normal' } })
    next()
})

const approveSubscription = asyncHandler(async (req, res, next) =>{
    try {
        let { id, uri } = req.body
        req.redirectURI = uri

        const usr = await User.findOne({_id: mongoose.Types.ObjectId(id)})
        usr.subscriptionStatus = true
        usr.paymentStatus = Date.now()
        usr.save(async function (err, result) {
            if (err) {
                console.log(result)
                res.status(400).send('Something went wrong')
            } else {
                next()
            }
        })
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
    getDatabase,
    approveSubscription
}