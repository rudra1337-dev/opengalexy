import { Router } from 'express'
import { getOrCreateDirectRoom, getUserRooms, getRoomById, setRoomTemp } from '../controllers/room.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)  // ← all room routes are protected

router.post('/direct', getOrCreateDirectRoom)
router.get('/', getUserRooms)
router.get('/:id', getRoomById)
router.patch('/:id/temp', setRoomTemp)

export default router