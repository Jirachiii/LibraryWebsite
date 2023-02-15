import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import {User} from '../models/user.js'
import {Order} from '../models/order.js'
import {Rating} from '../models/rating.js'
import {Book, BookCopy} from '../models/book.js'
import {Subscription} from '../models/subscription.js'
import {Coupon} from '../models/coupon.js'
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

const changeUserType = asyncHandler(async (req, res, next) =>{
    try {
        let { id, type, uri } = req.body
        req.redirectURI = uri

        const usr = await User.findOne({_id: mongoose.Types.ObjectId(id)})
        usr.type = type
        usr.save()

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

const removeUser = asyncHandler(async (req, res, next) =>{
    try {
        const { total, uri } = req.body
        req.redirectURI = uri

        for (var i = 0; i < total; i++) {
            await User.deleteOne({_id: mongoose.Types.ObjectId(req.body[i]) })
            await Order.deleteMany({user: mongoose.Types.ObjectId(req.body[0])})
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

const editProfile = asyncHandler(async (req, res, next) => {
    try {
        const {name, dob, address, img} = req.body
        const usr = req.user

        console.log(name, dob, address)

        if (name) {
            usr.fullName = name
        }
        if (dob) {
            usr.dob = dob
        }
        if (address) {
            usr.address = address
        }
        if (img){
            usr.img = img
        }

        usr.save()
        next()
    } catch (err) {
        console.log(err)
        res.status(400).send('Something went wrong')
    }
})

const borrowBook = asyncHandler(async (req, res, next) => {
    try {
        const {id} = req.body;
        const usr = req.user;

        let borrowDate = Date.now()

        const order = await Order.findOne({ user: req.user._id })
        const book = await Book.findOne({_id: mongoose.Types.ObjectId(id)})
        const copy = await BookCopy.findOne({ book: book._id, status: false})

        var borrowingCount = 0
        order.status.forEach((isBorrowing) => { if (isBorrowing) { borrowingCount++ } });

        if (borrowingCount >= usr.maxAvailable) {
            return res.status(400).send('Ran out of book borrow quota');
        }
        if (usr.subscriptionStatus == false) {
            return res.status(400).send('Plz wait while your subscription is being processed');
        }
        if (usr.subscriptionStatus != true) {
            return res.status(400).send('Plz subscribe to a plan');
        }

        if (order) {
            const subscription = await Subscription.findOne({ _id: usr.subscription });
            let returnDate = borrowDate + subscription.borrowDuration * 24 * 60 * 60 * 1000;

            var index = order.book.length
            for (var i = 0; i < order.book.length; i++) {
                if (order.book[i].equals(book._id)) {
                    index = i
                    break;
                }
            }

            if (index < order.book.length) {
                order.copy[index] = copy._id
                order.status[index] = true
                order.borrowDate[index] = borrowDate
                order.returnDate[index] = returnDate;
            } else {
                order.book.push(book._id)
                order.copy.push(copy._id)
                order.status.push(true)
                order.borrowDate.push(borrowDate)
                order.returnDate.push(returnDate)
            }

            order.save(async function (err, result) {
                if (err) {
                    console.log(result)
                    res.status(400).send('Something went wrong')
                } else {
                    copy.status = true
                    copy.save(function (err, result) {
                        if (err) {
                            console.log(result)
                            res.status(400).send('Something went wrong')
                        } else {
                            next()
                        }
                    })
                }
            })
        } else {
            await Order.create({
                user: usr._id,
                book: [book._id],
                copy: [copy._id],
                status: [true],
                borrowDate: [borrowDate],
                returnDate: [returnDate]
            })
        }

        next()
    } catch (err) {
        res.status(400).send('Something went wrong')
    }
})

const returnBook = asyncHandler(async (req, res, next) => {
    try {
        const {id} = req.body;
        const usr = req.user;

        const order = await Order.findOne({user: usr._id})
        const book = await Book.findOne({_id: id})

        if (order) {
            for (var i = 0; i < order.book.length; i++) {
                if (order.book[i].equals(book._id)) {
                    if (order.returnDate[i] < Date.now()) {
                        usr.warning += 1;
                        usr.save(function (err, result) {
                            if (err) {
                                console.log("Error")
                            } else {
                                console.log("Increase violation times")
                            }
                        })
                    }

                    order.status[i] = false
                    order.returnDate[i] = Date.now()

                    order.save(async function (err, result) {
                        if (err) {
                            console.log(result)
                            res.status(400).send('Something went wrong')
                        } else {
                            const copy = await BookCopy.findOne({ _id: order.copy[i] })
                            copy.status = false
                            copy.save(function (err, result) {
                                if (err) {
                                    console.log(result)
                                    res.status(400).send('Something went wrong')
                                } else {
                                    next()
                                }
                            })
                        }
                    })

                    break
                }
            }
            next()
        } else {
            res.status(400).send('Order not found')
        }
    } catch (err) {
        console.log(err)
        res.status(400).send('Something went wrong')
    }
})

const rateBook = asyncHandler(async (req, res, next) => {
    try {
        let {rating, bookID, uri} = req.body;
        req.redirectURI = uri

        const usr = req.user;
        const book = await Book.findOne({_id: mongoose.Types.ObjectId(bookID)});

        const ratingObj = await Rating.findOne({user: usr._id, book: book._id})
        if (ratingObj) {
            ratingObj.rating = rating
            ratingObj.save()
        } else {
            await Rating.create({ user: usr._id, book: book._id, rating: rating })
        }
        const ratingObjs = await Rating.find({book: book._id})
        book.rating = book.rating + (rating - book.rating)/ratingObjs.length

        book.save();

        console.log(ratingObj, book)

        next();
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



// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const usr = req.user
    if (usr) {
        return res.status(200).json(req.user)
    } else {
        return res.status(400).send('User not found')
    }

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
    getMe,
    changeUserType,
    removeUser,
    subscribe,
    borrowBook,
    returnBook,
    editProfile,
    rateBook,
}