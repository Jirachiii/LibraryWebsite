import { Router } from 'express'
import { registerUser, loginUser, logoutUser, changeUserType, removeUser,
    subscribe, borrowBook, returnBook, editProfile, rateBook } from '../controllers/user.js'
import { authenticate, authorizeAdmin, authorizeStaff } from '../middlewares/auth.js'
import { getBorrowing, getBorrowed } from '../middlewares/order.js'
import { getDatabase, approveSubscription } from '../middlewares/admin.js'

const router = Router()

router.post('/register', registerUser, function (req, res) {
    if (req.userExists) {
        res.render('register',
            {
                title: 'Register',
                userExists: req.userExists,
                popup: true
            })
    } else {
        res.render('register-success',
            {
                title: 'Register',
                popup: null
            })
    }
})
router.post('/login', loginUser, function (req, res) {
    if (!req.userExists || req.deactivated) {
        res.render('login',
            {
                title: 'Log in',
                userExists: req.userExists ? req.userExists : null,
                deactivated: req.deactivated ? req.deactivated : null,
                popup: true
            })
    } else {
        res.redirect('/')
    }
})
router.post('/subscribe', authenticate, subscribe, function (req, res) {
    if (req.type == '1' && req.status == true) {
        res.redirect('/subscriptions?status=success')
    } else if (req.type == '0' && req.status == true) {
        res.redirect('/subscriptions')
    } else {
        res.send(req.message)
    }
})

router.get('/login', authenticate, function (req, res) {
    res.render('login',
        {
            title: 'Log in',
            userExists: null,
            deactivated: null,
            popup: true
        })
})
router.get('/register', function (req, res) {
    res.render('register',
        {
            title: 'Register',
            userExists: null,
            popup: true
        })
})
router.get('/logout', logoutUser)

export { router }