import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const authMiddleware = async (req, res, next) => {
    try {
        // get token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' })
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // attach user to request
        req.user = await User.findById(decoded.id).select('-googleId')

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' })
        }

        next()

    } catch (error) {
        res.status(401).json({ message: 'Not authorized, invalid token' })
    }
}

export default authMiddleware