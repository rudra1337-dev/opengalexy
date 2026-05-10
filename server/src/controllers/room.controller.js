import Room from '../models/Room.model.js'
import User from '../models/User.model.js'
import { getExpiryDate } from '../utils/timeHelper.js'

// @desc    Get or create a direct room between 2 users
// @route   POST /api/rooms/direct
const getOrCreateDirectRoom = async (req, res) => {
    try {
        const { username } = req.body
        const currentUserId = req.user._id

        // find the other user by username
        const otherUser = await User.findOne({ username: username.toLowerCase() })
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (otherUser._id.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: 'You cannot chat with yourself' })
        }

        // check if direct room already exists between these 2 users
        let room = await Room.findOne({
            type: 'direct',
            members: { $all: [currentUserId, otherUser._id], $size: 2 }
        })

        if (room) {
            return res.json({ success: true, room })
        }

        // create new direct room
        room = await Room.create({
            type: 'direct',
            members: [currentUserId, otherUser._id]
        })

        res.status(201).json({ success: true, room })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all rooms for current user
// @route   GET /api/rooms
const getUserRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ members: req.user._id })
            .populate('members', 'username displayName avatar isOnline')
            .populate('lastMessage.sender', 'username')
            .populate('group', 'name avatar')
            .sort({ updatedAt: -1 })

        res.json({ success: true, rooms })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get single room by id
// @route   GET /api/rooms/:id
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('members', 'username displayName avatar isOnline lastSeen')

        if (!room) {
            return res.status(404).json({ message: 'Room not found' })
        }

        // check if user is a member
        const isMember = room.members.some(m => m._id.toString() === req.user._id.toString())
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' })
        }

        res.json({ success: true, room })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Set room as temp
// @route   PATCH /api/rooms/:id/temp
const setRoomTemp = async (req, res) => {
    try {
        const { duration } = req.body  // '1h', '24h', '7d' etc

        const room = await Room.findById(req.params.id)
        if (!room) return res.status(404).json({ message: 'Room not found' })

        const isMember = room.members.some(m => m.toString() === req.user._id.toString())
        if (!isMember) return res.status(403).json({ message: 'Access denied' })

        room.isTemp = true
        room.expiresAt = getExpiryDate(duration)
        await room.save()

        res.json({ success: true, room })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export { getOrCreateDirectRoom, getUserRooms, getRoomById, setRoomTemp }