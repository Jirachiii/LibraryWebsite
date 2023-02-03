import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { User } from '../models/user.js'
import { Subscription } from '../models/subscription.js'

const authenticate = asyncHandler(async (req, res, next) => {
  if (req.cookies.access_token) {
    try {
      // Verify token
      const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password')
      req.subscription = await Subscription.findOne({ _id: req.user.subscription })
    } catch (error) {
      res.clearCookie('access_token')
    }
  }

  next()
})

const authorizeAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.type == "admin") {
    req.authorizedAdmin = true
  } else {
    req.authorizedAdmin = false
  }

  next()
})

const authorizeStaff = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.type == "staff") {
    req.authorizedStaff = true
  } else {
    req.authorizedStaff = false
  }

  next()
})

const authorizeVIP = asyncHandler(async (req, res, next) => {
  if (req.subscription && req.subscription.name == "VIP") {
    req.authorizedVIP = true
  } else {
    req.authorizedVIP = false
  }

  next()
})

export {
  authenticate,
}