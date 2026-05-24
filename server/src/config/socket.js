import { Server } from 'socket.io'
import Message from '../models/Message.model.js'
import Room from '../models/Room.model.js'
import User from '../models/User.model.js'
import { getConfiguredClientOrigins } from '../utils/clientOrigin.js'

let io
const nearbyPresence = new Map()
const activeNearbyTransfers = new Map()

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: getConfiguredClientOrigins(),
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log(`⚡ Socket connected: ${socket.id}`)

        const broadcastNearbyUserJoined = (device, exceptUserId = null) => {
            nearbyPresence.forEach((_, userId) => {
                if (userId === exceptUserId) return
                io.to(userId).emit('nearby-user-joined', device)
            })
        }

        const removeNearbyPresence = () => {
            if (!socket.userId) return

            const existingPresence = nearbyPresence.get(socket.userId)
            if (!existingPresence || existingPresence.socketId !== socket.id) return

            nearbyPresence.delete(socket.userId)
            io.emit('nearby-user-left', { userId: socket.userId })
        }

        const cancelTransfersForUser = (userId, reason = 'peer_left') => {
            for (const [requestId, transfer] of activeNearbyTransfers.entries()) {
                if (transfer.from !== userId && transfer.to !== userId) continue

                const peerId = transfer.from === userId ? transfer.to : transfer.from
                io.to(peerId).emit('nearby-transfer-cancelled', {
                    requestId,
                    reason,
                    from: userId
                })
                activeNearbyTransfers.delete(requestId)
            }
        }

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

        // ── NEARBY SHARE DISCOVERY ─────────────────────
        socket.on('nearby-announce', ({ userId, username }) => {
            const resolvedUserId = socket.userId || userId
            if (!resolvedUserId) return

            socket.userId = resolvedUserId
            socket.join(resolvedUserId)

            const device = {
                userId: resolvedUserId,
                username,
                isAvailable: true
            }

            nearbyPresence.set(resolvedUserId, {
                ...device,
                socketId: socket.id
            })

            const devices = Array.from(nearbyPresence.values())
                .filter((entry) => entry.userId !== resolvedUserId)
                .map(({ socketId, ...entry }) => entry)

            socket.emit('nearby-users', devices)
            broadcastNearbyUserJoined(device, resolvedUserId)
        })

        socket.on('nearby-leave', () => {
            removeNearbyPresence()
            cancelTransfersForUser(socket.userId, 'peer_left')
        })

        socket.on('nearby-transfer-request', ({ requestId, to, file }) => {
            if (!socket.userId || !requestId || !to || !file) return

            activeNearbyTransfers.set(requestId, {
                requestId,
                from: socket.userId,
                to,
                file,
                status: 'requested',
                createdAt: Date.now()
            })

            io.to(to).emit('nearby-transfer-request', {
                requestId,
                from: socket.userId,
                fromUsername:
                    nearbyPresence.get(socket.userId)?.username || 'unknown',
                file
            })
        })

        socket.on(
            'nearby-transfer-response',
            ({ requestId, to, accepted, reason = null }) => {
                const transfer = activeNearbyTransfers.get(requestId)
                if (!transfer) return

                if (!accepted) {
                    activeNearbyTransfers.delete(requestId)
                } else {
                    activeNearbyTransfers.set(requestId, {
                        ...transfer,
                        status: 'accepted'
                    })
                }

                io.to(to).emit('nearby-transfer-response', {
                    requestId,
                    accepted,
                    from: socket.userId,
                    reason
                })
            }
        )

        // ── NEARBY SHARE SIGNALING ─────────────────────
        socket.on('nearby-offer', ({ to, requestId, offer }) => {
            io.to(to).emit('nearby-offer', {
                from: socket.userId,
                requestId,
                offer
            })
        })

        socket.on('nearby-answer', ({ to, requestId, answer }) => {
            io.to(to).emit('nearby-answer', { requestId, answer })
        })

        socket.on('nearby-ice-candidate', ({ to, requestId, candidate }) => {
            io.to(to).emit('nearby-ice-candidate', { requestId, candidate })
        })

        socket.on('nearby-transfer-complete', ({ requestId }) => {
            activeNearbyTransfers.delete(requestId)
        })

        socket.on('nearby-transfer-cancel', ({ requestId, to, reason }) => {
            activeNearbyTransfers.delete(requestId)
            io.to(to).emit('nearby-transfer-cancelled', {
                requestId,
                reason,
                from: socket.userId
            })
        })

        // ── DISCONNECT ─────────────────────────────────
        socket.on('disconnect', async () => {
            removeNearbyPresence()

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

            cancelTransfersForUser(socket.userId)
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
