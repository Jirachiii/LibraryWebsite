import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import {User} from '../models/user.js'
import {Book, BookCopy} from '../models/book.js'
import mongoose from "mongoose";


// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
    const {fullName, dob, address, email, password} = req.body

    // Check if user exists
    const userExists = await User.findOne({email: email})

    if (userExists) {
        req.userExists = true;
        next()
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password, salt)
    // Create user
    let user
    try {
        user = await User.create({
            email: email,
            password: hashedpassword,
            fullName: fullName,
            dob: dob,
            address: address
        })
    } catch (error) {
        console.log(error)
    }

    if (user) {
        res.cookie('access_token', generateToken(user.id), { httpOnly: true })
    }

    next()
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body

    // Check for user email
    const user = await User.findOne({email: email})

    if (user.warning >= 3) {
        req.deactivated = true
        next()
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        res.cookie('access_token', generateToken(user.id), { httpOnly: true })
        req.userExists = true
    } else {
        req.userExists = false
    }

    next()
})

// @desc    Terminate user session
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('access_token')
    res.redirect('/')
})

function subscribeHandler(res, subscribeType, usr, plan, bookIncrease) {
    const numBorrowedBooks = usr.borrowAvailable - usr.maxAvailable;
    let subscriptionTime;

    switch (subscribeType.type) {
        case 'Monthly':
            subscriptionTime = 31 * 24 * 60 * 60000
            break;
        case 'Annual':
            subscriptionTime = 365 * 24 * 60 * 60000
            break;
        default:
            throw new Error('Invalid type')
    }

    if (numBorrowedBooks + subscribeType.borrowAmount + bookIncrease < 0) {
        res.status(400).send('Negative book borrow balance! Plz return books')
    } else {
        usr.maxAvailable = subscribeType.borrowAmount + bookIncrease;
        usr.borrowAvailable = numBorrowedBooks + usr.maxAvailable;
        usr.paymentStatus = Date.now() + subscriptionTime
    }
}

const subscribe = asyncHandler(async (req, res, next) => {
    const {plan, type, status} = req.body
    const usr = req.user

    let statusUser = true
    let message = ""
    switch (status) {
        case '1':
            if (usr.subscription != null) {
                statusUser = false
                message = "Please unsubscribe first"
                break;
            }

            const normalMonthlyType = await Subscription.findOne({type: 'Monthly', name: 'Normal'});
            const normalAnnuallyType = await Subscription.findOne({type: 'Annual', name: 'Normal'});
            const vipMonthlyType = await Subscription.findOne({type: 'Monthly', name: 'VIP'});
            const vipAnnuallyType = await Subscription.findOne({type: 'Annual', name: 'VIP'});
            const availableCoupon = await Coupon.findOne({
                startDate: {
                    $lte: new Date()
                }
                , endDate: {
                    $gte: new Date()
                }
            })
            //Deal with null case
            let bookIncrease;
            if (availableCoupon) {
                bookIncrease = availableCoupon.bookAmountIncrease;
            } else {
                bookIncrease = 0;
            }
            switch (plan) {
                case 'Normal':
                    switch (type) {
                        case 'Monthly':
                            subscribeHandler(res, normalMonthlyType, usr, plan, bookIncrease);
                            usr.subscription = mongoose.Types.ObjectId('629799d2c70d8f825398d57a');
                            break;
                        case 'Annual':
                            subscribeHandler(res, normalAnnuallyType, usr, plan, bookIncrease);
                            usr.subscription = mongoose.Types.ObjectId('62979aa4c70d8f825398d57b');
                            break;
                    }
                    break;
                case 'VIP':
                    switch (type) {
                        case 'Monthly':
                            subscribeHandler(res, vipMonthlyType, usr, plan, bookIncrease);
                            usr.subscription = mongoose.Types.ObjectId('62979ad0c70d8f825398d580');
                            break;
                        case 'Annual':
                            subscribeHandler(res, vipAnnuallyType, usr, plan, bookIncrease);
                            usr.subscription = mongoose.Types.ObjectId('62979afac70d8f825398d587');
                            break;
                    }
                    break;
            }
            usr.subscriptionStatus = false

            usr.save(function (err, result) {
                if (err) {
                    statusUser = false
                    message = "An error has occured"
                    console.log("Error while subscribe")
                } else {
                    console.log("Subscribed")
                }
            })
            break;
        case '0':
            if (usr.subscription == null)
                break;

            User.findById(usr._id).populate('subscription').exec(function (err, usr) {
                if (usr.borrowAvailable == usr.maxAvailable) {
                    usr.borrowAvailable = 0;
                    usr.maxAvailable = 0;
                    usr.subscriptionStatus = null;
                    usr.paymentStatus = null;
                    usr.subscription = null;

                    usr.save(function (err, result) {
                        if (err) {
                            statusUser = false
                            message = "An error has occured"
                            console.log("Error while unsubscribe")
                        } else {
                            console.log("Unsubscribed")
                        }
                    })
                } else {
                    message = 'Please return all books before unsubscribing / changing plans'
                }
            })
            break;
    }

    req.type = status
    req.status = statusUser
    req.message = message
    next()
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

export {
    registerUser,
    loginUser,
    logoutUser,
    subscribe,
}