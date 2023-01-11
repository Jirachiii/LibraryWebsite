import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import {User, UserType} from '../models/user.js'
import {Coupon} from '../models/index.js'
import mongoose from "mongoose";


// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body

    if (!username || !email || !password) {
        res.status(400).send('Please add all fields')
        // throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await User.findOne({email})

    if (userExists) {
        res.status(400).send('User already exists')
        // throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create user
    var user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    if (user) {
        res.status(200).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(400).send('Invalid user data')
        // throw new Error('Invalid user data')
    }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    // Check for user email
    const user = await User.findOne({email})

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(400).send('Invalid credentials')
        // throw new Error('Invalid credentials')
    }
})

const subscribe = asyncHandler(async (req, res) => {
    //TODO: Add payment system
    const {status, type} = req.body
    const usr = req.user

    const normalType = JSON.parse(JSON.stringify(await UserType.findOne({typeName: 'normal'})));
    const vipType = JSON.parse(JSON.stringify(await UserType.findOne({typeName: 'vip'})));

    if (status) {
        const numBorrowedBooks = usr.borrowAvailable - usr.maxAvailable;
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
        if (availableCoupon){
            bookIncrease = availableCoupon.bookAmountIncrease;
        }else{
            bookIncrease = 0;
        }
        switch (type) {
            case '1':
                if (numBorrowedBooks +normalType.maxBook + bookIncrease <0){
                    res.status(400).send('Negative book borrow balance! Plz return books')
                }else{
                    usr.userType = mongoose.Types.ObjectId('62713cd9be4587022f6803c8');
                    usr.maxAvailable = normalType.maxBook + bookIncrease;
                    usr.borrowAvailable = numBorrowedBooks + usr.maxAvailable;
                    usr.paymentStatus = Date.now() + 31*24*60*60000
                    usr.save(function (err) {
                        if (err)
                        {
                            // TODO: Handle error!
                        }else{
                            res.status(200).send('Success')
                        }
                    })
                }
                break;
            case '2':
                if (numBorrowedBooks +normalType.maxBook +bookIncrease <0){
                    res.status(400).send('Negative book borrow balance! Plz return books')
                }else{
                    usr.userType = mongoose.Types.ObjectId('62713cd9be4587022f6803c8');
                    usr.maxAvailable = normalType.maxBook + bookIncrease;
                    usr.borrowAvailable = numBorrowedBooks + usr.maxAvailable;
                    usr.paymentStatus = Date.now() + 365*24*60*60000
                    usr.save(function (err) {
                        if (err)
                        {
                            // TODO: Handle error!
                        }else{
                            res.status(200).send('Success')
                        }
                    })
                }
                break;
            case '3':
                if (numBorrowedBooks +vipType.maxBook +bookIncrease <0){
                    res.status(400).send('Negative book borrow balance! Plz return books')
                }else{
                    usr.userType = mongoose.Types.ObjectId('62713cd9be4587022f6803c8');
                    usr.maxAvailable = vipType.maxBook + bookIncrease;
                    usr.borrowAvailable = numBorrowedBooks + usr.maxAvailable;
                    usr.paymentStatus = Date.now() + 365*24*60*60000
                    usr.save(function (err) {
                        if (err)
                        {
                            // TODO: Handle error!
                        }else{
                            res.status(200).send('Success')
                        }
                    })
                }
                break;
        }
    } else {

    }
})

const apiDemo = asyncHandler(async (req, res) => {
    console.log(JSON.parse(JSON.stringify(await User.find())))
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
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
    getMe,
    apiDemo,
    subscribe
}