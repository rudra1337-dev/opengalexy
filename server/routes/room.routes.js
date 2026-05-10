import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.json({ message: 'Room routes are not implemented yet.' })
})

export default router
