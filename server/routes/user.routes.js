import { Router } from 'express'
import { searchUsers, getUserByUsername } from '../controllers/user.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/search', searchUsers)
router.get('/:username', getUserByUsername)

export default router