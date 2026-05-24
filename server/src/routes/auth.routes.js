
import { Router } from 'express'
import passport from 'passport'
import { googleCallback, checkUsername, setUsername, getMe, logout } from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { resolveClientOrigin } from '../utils/clientOrigin.js'

const router = Router()

// Google OAuth — step 1: redirect to Google
router.get('/google', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: req.query.redirect || undefined
    })(req, res, next)
})

// Google OAuth — step 2: Google redirects back here
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (error, user) => {
        if (error || !user) {
            const clientOrigin = resolveClientOrigin(req.query.state)

            if (clientOrigin) {
                return res.redirect(`${clientOrigin}/?error=auth_failed`)
            }

            return res.status(401).json({ message: 'Authentication failed' })
        }

        req.user = user
        return googleCallback(req, res)
    })(req, res, next)
})

// check if username is available
router.get('/check-username/:username', checkUsername)

// set username during onboarding (protected)
router.post('/set-username', authMiddleware, setUsername)

// get current user (protected)
router.get('/me', authMiddleware, getMe)

// logout
router.post('/logout', logout)

export default router
