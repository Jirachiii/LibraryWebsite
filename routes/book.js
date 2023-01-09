import { Router } from 'express'
import { addBook, removeBook } from '../controllers/book.js'

const router = Router()

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