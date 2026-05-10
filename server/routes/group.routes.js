import { Router } from 'express'
import { createGroup, discoverGroups, joinGroup, getMyGroups, setGroupTemp } from '../controllers/group.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.get('/discover', discoverGroups)       // ← public
router.use(authMiddleware)                     // ← protected below
router.post('/', createGroup)
router.get('/mine', getMyGroups)
router.post('/join/:inviteCode', joinGroup)
router.patch('/:id/temp', setGroupTemp)        // ← admin only (checked inside controller)

export default router