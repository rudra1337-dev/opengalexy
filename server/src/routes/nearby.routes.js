import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.json({ message: 'Nearby routes are not implemented yet.' })
})

export default router
