import generateToken from '../utils/generateToken.js'
import User from '../models/User.model.js'

// @desc    Google OAuth callback — send JWT to client
// @route   GET /api/auth/google/callback
const googleCallback = (req, res) => {
    try {
        const token = generateToken(req.user._id)

        const isNewUser = !req.user.usernameSet

        // send token as cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })

        // redirect to frontend — new users go to username picker
        if (isNewUser) {
            res.redirect(`${process.env.CLIENT_URL}/onboarding`)
        } else {
            res.redirect(`${process.env.CLIENT_URL}/home`)
        }

    } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
    }
}

// @desc    Check username availability
// @route   GET /api/auth/check-username/:username
const checkUsername = async (req, res) => {
    try {
        const { username } = req.params
        const exists = await User.findOne({ username: username.toLowerCase() })

        res.json({
            available: !exists,
            username: username.toLowerCase()
        })

    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

// @desc    Set username after Google login (onboarding)
// @route   POST /api/auth/set-username
const setUsername = async (req, res) => {
    try {
        const { username } = req.body
        const userId = req.user.id  // from auth middleware

        // check again if available (race condition protection)
        const exists = await User.findOne({ username: username.toLowerCase() })
        if (exists) {
            return res.status(400).json({ message: 'Username already taken' })
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username: username.toLowerCase(), usernameSet: true },
            { new: true }
        )

        res.json({ success: true, user })

    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId')
        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

// @desc    Logout
// @route   POST /api/auth/logout
const logout = (req, res) => {
    res.clearCookie('token')
    res.json({ success: true, message: 'Logged out successfully' })
}

export { googleCallback, checkUsername, setUsername, getMe, logout }