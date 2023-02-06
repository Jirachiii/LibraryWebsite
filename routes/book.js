import { Router } from 'express'
import { authenticate, authorizeAdmin, authorizeStaff, authorizeVIP } from '../middlewares/auth.js'
import { getBooks, getBookInfo, getTags, getSpecialDocs, addBook, removeBook } from '../controllers/book.js'
import { getBorrowStatus } from '../middlewares/order.js'

const router = Router()

router.get('/', authenticate, getTags, getBooks, function(req, res) {
    res.render('books',
        {
            title: 'Books',
            user: req.user ? req.user : null,
            books: req.books ? req.books : null,
            authors: req.authors ? req.authors : null,
            tags: req.tags? req.tags : null
        })
})

router.get('/book-details', authenticate, getBookInfo, getBorrowStatus, function (req, res) {
    res.render('book-details',
        {
            title: 'Book Details',
            user: req.user ? req.user : null,
            book: req.book ? req.book : null,
            author: req.author ? req.author : null,
            publisher: req.publisher ? req.publisher : null,
            tags: req.tags ? req.tags : null,
            userRating: req.userRating? req.userRating.rating : 0,
            current: req.current ? req.current : 0,
            total: req.total ? req.total : 0,
            borrowing: req.borrowing ? req.borrowing : null
        })
})

router.get('/special-docs', authenticate, authorizeVIP, authorizeStaff, authorizeAdmin, getSpecialDocs, function (req, res) {
    const authorized = (req.authorizedStaff || req.authorizedAdmin || req.authorizedVIP) ? true : false
    if (authorized) {
        res.render('special-docs',
            {
                title: 'Special Documents',
                user: req.user ? req.user : null,
                books: req.books ? req.books : null,
                authors: req.authors ? req.authors : null
            })
    } else {
        res.status(400).send('Unauthorized access')
    }
})

router.post('/addBook', authenticate, authorizeAdmin, authorizeStaff, function(req, res, next) {
    const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
    if (authorized) {
        next()
    } else {
        res.status(400).send('Unauthorized access')
    } 
}, addBook, function(req, res) {
    res.redirect('/user/admin-tools/books')
})

router.post('/removeBook', authenticate, authorizeAdmin, authorizeStaff, function(req, res, next) {
    const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
    if (authorized) {
        next()
    } else {
        res.status(400).send('Unauthorized access')
    } 
}, removeBook, function(req, res) {
    res.redirect('/user/admin-tools/books')
})

export { router }