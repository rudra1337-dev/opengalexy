
import { Router } from 'express'
import passport from 'passport'
import { googleCallback, checkUsername, setUsername, getMe, logout } from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

// Google OAuth — step 1: redirect to Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

// Google OAuth — step 2: Google redirects back here
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
)

// check if username is available
router.get('/check-username/:username', checkUsername)

// set username during onboarding (protected)
router.post('/set-username', authMiddleware, setUsername)

// get current user (protected)
router.get('/me', authMiddleware, getMe)

// logout
router.post('/logout', logout)

export default router