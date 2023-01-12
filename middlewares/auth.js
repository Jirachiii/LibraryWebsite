import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { User } from '../models/user.js'

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

export {
  authenticate,
}