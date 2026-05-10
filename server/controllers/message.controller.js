import Message from '../models/Message.model.js'
import Room from '../models/Room.model.js'
import { getExpiryDate } from '../utils/timeHelper.js'

// @desc    Get messages for a room
// @route   GET /api/messages/:roomId
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 30

        // verify user is in this room
        const room = await Room.findById(roomId)
        if (!room) return res.status(404).json({ message: 'Room not found' })

        const isMember = room.members.some(m => m.toString() === req.user._id.toString())
        if (!isMember) return res.status(403).json({ message: 'Access denied' })

        const messages = await Message.find({ roomId, isBurned: false })
            .populate('sender', 'username displayName avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        res.json({ success: true, messages: messages.reverse() })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Send a message
// @route   POST /api/messages/:roomId
const sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params
        const { content, isTemp, duration, isBurnAfterRead, type } = req.body

        // verify user is in this room
        const room = await Room.findById(roomId)
        if (!room) return res.status(404).json({ message: 'Room not found' })

        const isMember = room.members.some(m => m.toString() === req.user._id.toString())
        if (!isMember) return res.status(403).json({ message: 'Access denied' })

        const message = await Message.create({
            roomId,
            sender: req.user._id,
            content,
            type: type || 'text',
            isTemp: isTemp || false,
            expiresAt: isTemp ? getExpiryDate(duration) : null,
            isBurnAfterRead: isBurnAfterRead || false
        })

        // update room last message
        await Room.findByIdAndUpdate(roomId, {
            lastMessage: {
                content,
                sender: req.user._id,
                sentAt: new Date()
            }
        })

        await message.populate('sender', 'username displayName avatar')

        res.status(201).json({ success: true, message })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Mark message as read (also burns if burnAfterRead)
// @route   PATCH /api/messages/:id/read
const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
        if (!message) return res.status(404).json({ message: 'Message not found' })

        // add to readBy if not already there
        if (!message.readBy.includes(req.user._id)) {
            message.readBy.push(req.user._id)
        }

        // burn if burn after read
        if (message.isBurnAfterRead) {
            message.isBurned = true
        }

        await message.save()

        res.json({ success: true, message })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export { getMessages, sendMessage, markAsRead }