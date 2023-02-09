import { Router } from 'express'
import { getBestBooks, getBestAuthors, getCoupons, getSubscriptions,
  addCoupon, removeCoupon, addSubscription, removeSubscription, search } from '../controllers/index.js'
import { getTags } from '../controllers/book.js'
import { authenticate, authorizeAdmin, authorizeStaff } from '../middlewares/auth.js'
import { removeOrder } from '../middlewares/order.js'

const router = Router()

router.get('/', authenticate, getBestBooks, getBestAuthors, getCoupons, function (req, res) {
  res.render('index', {
    title: 'Home Page',
    user: req.user ? req.user : null,
    bestBooks: req.bestBooks ? req.bestBooks : null,
    bestBooksAuthors: req.bestBooksAuthors ? req.bestBooksAuthors : null,
    bestAuthors: req.bestAuthors ? req.bestAuthors : null,
    coupons: req.coupons ? req.coupons : null
  })
})

router.get('/coupons', authenticate, getCoupons, function (req, res) {
  res.render('news-offers', {
    title: 'News & Offers',
    user: req.user ? req.user : null,
    coupons: req.coupons ? req.coupons : null
  })
})

router.get('/subscriptions', authenticate, getSubscriptions, function (req, res) {
  if (req.query.status) {
      res.render('subscription-success',
          {
              title: 'Subscriptions',
              user: req.user ? req.user : null
          })
  } else {
      res.render('subscription',
          {
              title: 'Subscriptions',
              user: req.user ? req.user : null,
              subscription: req.subscription ? req.subscription : null,
              subscriptions: req.subscriptions ? req.subscriptions : null
          })
  }
})

router.get('/search', authenticate, search, getTags, function(req, res) {
  res.render('books',
    {
        title: 'Search Results',
        user: req.user ? req.user : null,
        books: req.books ? req.books : null,
        authors: req.authors ? req.authors : null,
        tags: req.tags? req.tags : null
    })
})

router.post('/removeOrder', authenticate, authorizeAdmin, function(req, res, next) {
  if (req.authorizedAdmin) {
      next()
  } else {
      res.status(400).send('Unauthorized access')
  } 
}, removeOrder, function(req, res) {
  res.redirect('/user/admin-tools/orders')
})

router.post('/addCoupon', authenticate, authorizeAdmin, authorizeStaff, function(req, res, next) {
  const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
  if (authorized) {
      next()
  } else {
      res.status(400).send('Unauthorized access')
  } 
}, addCoupon, function(req, res) {
  res.redirect('/user/admin-tools/coupons')
})

router.post('/removeCoupon', authenticate, authorizeAdmin, authorizeStaff, function(req, res, next) {
  if (req.authorizedAdmin) {
      next()
  } else {
      res.status(400).send('Unauthorized access')
  } 
}, removeCoupon, function(req, res) {
  res.redirect('/user/admin-tools/coupons')
})

router.post('/addSubscription', authenticate, authorizeAdmin, function(req, res, next) {
  const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
  if (authorized) {
      next()
  } else {
      res.status(400).send('Unauthorized access')
  } 
}, addSubscription, function(req, res) {
  res.redirect('/user/admin-tools/subscriptions')
})

router.post('/removeSubscription', authenticate, authorizeAdmin, function(req, res, next) {
  if (req.authorizedAdmin) {
      next()
  } else {
      res.status(400).send('Unauthorized access')
  } 
}, removeSubscription, function(req, res) {
  res.redirect('/user/admin-tools/subscriptions')
})

export {
  router
}