import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const guestMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            req.user = null  // ← guest, no user attached
            return next()
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-googleId')
        next()

    } catch (error) {
        req.user = null  // ← invalid token = treat as guest
        next()
    }
}

export default guestMiddleware