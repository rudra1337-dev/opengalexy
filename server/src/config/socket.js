import { Server } from 'socket.io'
import Message from '../models/Message.model.js'
import Room from '../models/Room.model.js'
import User from '../models/User.model.js'

let io

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log(`⚡ Socket connected: ${socket.id}`)

        // ── USER COMES ONLINE ──────────────────────────
        socket.on('user-online', async (userId) => {
            socket.userId = userId
            socket.join(userId)  // ← personal room for direct notifications

            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: new Date()
            })

            socket.broadcast.emit('user-status', { userId, status: 'online' })
            console.log(`🟢 User online: ${userId}`)
        })

        // ── JOIN A CHAT ROOM ───────────────────────────
        socket.on('join-room', (roomId) => {
            socket.join(roomId)
            console.log(`👤 ${socket.userId} joined room: ${roomId}`)
        })

        // ── LEAVE A CHAT ROOM ──────────────────────────
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId)
            console.log(`👋 ${socket.userId} left room: ${roomId}`)
        })

        // ── SEND MESSAGE ───────────────────────────────
        socket.on('send-message', async (data) => {
            try {
                const { roomId, content, isTemp, duration, isBurnAfterRead, type } = data

                // save to DB
                const message = await Message.create({
                    roomId,
                    sender: socket.userId,
                    content,
                    type: type || 'text',
                    isTemp: isTemp || false,
                    expiresAt: isTemp ? getExpiryFromDuration(duration) : null,
                    isBurnAfterRead: isBurnAfterRead || false
                })

                // update room last message
                await Room.findByIdAndUpdate(roomId, {
                    lastMessage: {
                        content,
                        sender: socket.userId,
                        sentAt: new Date()
                    }
                })

                await message.populate('sender', 'username displayName avatar')

                // emit to everyone in the room
                io.to(roomId).emit('message-received', message)

            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        })

        // ── TYPING INDICATOR ───────────────────────────
        socket.on('typing', ({ roomId, username }) => {
            socket.to(roomId).emit('user-typing', { username })
        })

        socket.on('stop-typing', ({ roomId }) => {
            socket.to(roomId).emit('user-stop-typing')
        })

        // ── MESSAGE READ ───────────────────────────────
        socket.on('message-read', async ({ messageId, roomId }) => {
            try {
                const message = await Message.findById(messageId)
                if (!message) return

                if (!message.readBy.includes(socket.userId)) {
                    message.readBy.push(socket.userId)
                }

                // burn if burn after read
                if (message.isBurnAfterRead) {
                    message.isBurned = true
                    await message.save()
                    // tell everyone in room to delete this message from UI
                    io.to(roomId).emit('message-burned', { messageId })
                } else {
                    await message.save()
                    io.to(roomId).emit('message-seen', { messageId, userId: socket.userId })
                }

            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        })

        // ── CALL SIGNALING ─────────────────────────────
        socket.on('call-offer', ({ to, offer, callType }) => {
            io.to(to).emit('call-incoming', {
                from: socket.userId,
                offer,
                callType  // 'audio' or 'video'
            })
        })

        socket.on('call-answer', ({ to, answer }) => {
            io.to(to).emit('call-answered', { answer })
        })

        socket.on('call-ice-candidate', ({ to, candidate }) => {
            io.to(to).emit('call-ice-candidate', { candidate })
        })

        socket.on('call-end', ({ to }) => {
            io.to(to).emit('call-ended')
        })

        // ── NEARBY SHARE SIGNALING ─────────────────────
        socket.on('nearby-offer', ({ to, offer }) => {
            io.to(to).emit('nearby-offer', {
                from: socket.userId,
                offer
            })
        })

        socket.on('nearby-answer', ({ to, answer }) => {
            io.to(to).emit('nearby-answer', { answer })
        })

        socket.on('nearby-ice-candidate', ({ to, candidate }) => {
            io.to(to).emit('nearby-ice-candidate', { candidate })
        })

        // ── DISCONNECT ─────────────────────────────────
        socket.on('disconnect', async () => {
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date()
                })
                socket.broadcast.emit('user-status', {
                    userId: socket.userId,
                    status: 'offline'
                })
                console.log(`🔴 User offline: ${socket.userId}`)
            }
            console.log(`❌ Socket disconnected: ${socket.id}`)
        })
    })
}

// helper inside socket.js
const getExpiryFromDuration = (duration) => {
    const map = {
        '5m': 5 * 60 * 1000,
        '1h': 1 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    }
    if (!map[duration]) return null
    return new Date(Date.now() + map[duration])
}

const getIO = () => io

export { initSocket, getIO }