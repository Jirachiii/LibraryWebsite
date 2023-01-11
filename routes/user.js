import { Router } from 'express'
import { registerUser, loginUser, getMe, apiDemo, subscribe } from '../controllers/user.js'
import { protect } from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.get('/api-demo', apiDemo)
router.post('/subscribe',protect, subscribe)
export { router }