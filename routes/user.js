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
router.post('/editProfile', authenticate, editProfile, function(req, res) {
    res.redirect('/user/profile')
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
router.post('/approveSubscription', authenticate, authorizeStaff, authorizeAdmin, function(req, res, next) {
    const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
    if (!authorized) {
        res.status(400).send('Unauthorized access')
    }
    next()
}, approveSubscription, function(req, res) {
    res.redirect(req.redirectURI)
})
router.post('/borrowBook', authenticate, borrowBook, function(req, res) {
    res.redirect('/user/profile')
})
router.post('/rateBook', authenticate, rateBook, function(req, res) {
    res.redirect(req.redirectURI)
})
router.post('/returnBook', authenticate, returnBook, function(req, res) {
    res.redirect('/user/profile')
})
router.post('/changeuserType', authenticate, authorizeAdmin, function(req, res, next) {
    if (req.authorizedAdmin) {
        next()
    } else {
        res.status(400).send('Unauthorized access')
    }
}, changeUserType, function(req, res) {
    res.redirect(req.redirectURI)
})
router.post('/removeUser', authenticate, authorizeAdmin, function(req, res, next) {
    if (req.authorizedAdmin) {
        next()
    } else {
        res.status(400).send('Unauthorized access')
    }
}, removeUser, function(req, res) {
    res.redirect(req.redirectURI)
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

router.get('/profile', authenticate, getBorrowing, getBorrowed, function (req, res) {
    res.render('profile',
        {
            title: 'My Profile',
            user: req.user ? req.user : null,
            subscription: req.subscription ? req.subscription : null,
            borrowing : req.borrowingBooks ? req.borrowingBooks : [],
            borrowingDate : req.borrowingDate ? req.borrowingDate : null,
            returningDate : req.returningDate ? req.returningDate : null,
            borrowed : req.borrowedBooks ? req.borrowedBooks : [],
            borrowedDate : req.borrowedDate ? req.borrowedDate : null,
            returnedDate : req.returnedDate ? req.returnedDate : null,
        })
})
router.get('/profile-edit', authenticate, getBorrowing, getBorrowed, function (req, res) {
    res.render('profile-edit',
        {
            title: 'Edit Profile',
            user: req.user ? req.user : null
        })
})

router.get('/admin-tools/:tab', authenticate, authorizeStaff, authorizeAdmin, getDatabase, function(req, res) {
    const authorized = (req.authorizedAdmin || req.authorizedStaff) ? true : false
    if (!authorized) {
        res.status(400).send('Unauthorized access')
    }

    const tab = req.params.tab

    if (tab == 'orders') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Orders',
                user: req.user ? req.user : null,
                orders: req.orders ? req.orders : null
            })
    } else if (tab == 'books') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Books',
                user: req.user ? req.user : null,
                books: req.books ? req.books : null
            })
    } else if (tab == 'authors') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Authors',
                user: req.user ? req.user : null,
                authors: req.authors ? req.authors : null
            })
    } else if (tab == 'publishers') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Publishers',
                user: req.user ? req.user : null,
                publishers: req.publishers ? req.publishers : null
            })
    } else if (tab == 'coupons') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'News & Offers',
                user: req.user ? req.user : null,
                coupons: req.coupons ? req.coupons : null
            })
    } else if (tab == 'subscriptions') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Subscription Plans',
                user: req.user ? req.user : null,
                subscriptions: req.subscriptions ? req.subscriptions : null
            })
    } else if (tab == 'readers') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Readers',
                user: req.user ? req.user : null,
                readers: req.readers ? req.readers : null
            })
    } else if (tab == 'staff') {
        res.render('admin-tools',
            {
                title: 'Admin Tools',
                tabTitle: 'Staff',
                user: req.user ? req.user : null,
                staff: req.staff ? req.staff : null
            })
    }
})

router.get('/logout', logoutUser)

export { router }