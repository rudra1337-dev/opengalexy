import User from '../models/User.model.js'

// @desc    Search users by username
// @route   GET /api/users/search?q=rudra
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query
        if (!q) return res.status(400).json({ message: 'Query required' })

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('username displayName avatar isOnline lastSeen')
            .limit(10)

        res.json({ success: true, users })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get user by username
// @route   GET /api/users/:username
const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username.toLowerCase()
        }).select('username displayName avatar isOnline lastSeen')

        if (!user) return res.status(404).json({ message: 'User not found' })

        res.json({ success: true, user })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export { searchUsers, getUserByUsername }