import { Router } from 'express'
import { getMessages, sendMessage, markAsRead } from '../controllers/message.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/:roomId', getMessages)
router.post('/:roomId', sendMessage)
router.patch('/:id/read', markAsRead)

export default router