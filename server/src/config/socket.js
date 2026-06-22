import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import Message from '../models/Message.model.js'
import Room from '../models/Room.model.js'
import User from '../models/User.model.js'
import { getConfiguredClientOrigins } from '../utils/clientOrigin.js'

let io
const nearbyPresence = new Map()
const activeNearbyTransfers = new Map()
const activeCalls = new Map()
const CALL_RING_TIMEOUT_MS = 45 * 1000

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: getConfiguredClientOrigins(),
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    io.use(async (socket, next) => {
        try {
            const token = getSocketToken(socket)
            if (!token) {
                return next(new Error('Not authorized'))
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded.id).select('_id')

            if (!user) {
                return next(new Error('User not found'))
            }

            socket.userId = user._id.toString()
            next()
        } catch {
            next(new Error('Not authorized'))
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
        socket.on('user-online', async () => {
            const resolvedUserId = socket.userId
            socket.join(resolvedUserId)  // ← personal room for direct notifications

            const lastSeen = new Date()

            await User.findByIdAndUpdate(resolvedUserId, {
                isOnline: true,
                lastSeen
            })

            socket.broadcast.emit('user-status', {
                userId: resolvedUserId,
                status: 'online',
                lastSeen
            })
            console.log(`🟢 User online: ${resolvedUserId}`)
        })

        // ── JOIN A CHAT ROOM ───────────────────────────
        socket.on('join-room', async (roomId) => {
            const room = await Room.findOne({
                _id: roomId,
                members: socket.userId
            }).select('_id')

            if (!room) {
                socket.emit('error', { message: 'Access denied to room' })
                return
            }

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
                const {
                    roomId,
                    content,
                    isTemp,
                    duration,
                    isBurnAfterRead,
                    type,
                    clientTempId
                } = data

                const room = await Room.findOne({
                    _id: roomId,
                    members: socket.userId
                }).select('members')

                if (!room) {
                    socket.emit('error', { message: 'Access denied to room' })
                    return
                }

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
                const messagePayload = {
                    ...message.toObject(),
                    clientTempId: clientTempId || null
                }

                // emit to everyone in the room
                io.to(roomId).emit('message-received', messagePayload)

                await Promise.all(
                    room.members.map((memberId) =>
                        emitChatUpdated(memberId.toString(), roomId)
                    )
                )

            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        })

        // ── TYPING INDICATOR ───────────────────────────
        socket.on('typing', async ({ roomId, username }) => {
            const room = await Room.findOne({
                _id: roomId,
                members: socket.userId
            }).select('_id')

            if (!room) return
            socket.to(roomId).emit('user-typing', { username })
        })

        socket.on('stop-typing', async ({ roomId }) => {
            const room = await Room.findOne({
                _id: roomId,
                members: socket.userId
            }).select('_id')

            if (!room) return
            socket.to(roomId).emit('user-stop-typing')
        })

        // ── MESSAGE READ ───────────────────────────────
        socket.on('message-read', async ({ messageId, roomId }) => {
            try {
                const message = await Message.findById(messageId)
                if (!message) return

                const resolvedRoomId = message.roomId?.toString() || roomId
                const room = await Room.findOne({
                    _id: resolvedRoomId,
                    members: socket.userId
                }).select('members')

                if (!room) {
                    socket.emit('error', { message: 'Access denied to room' })
                    return
                }

                if (
                    !message.readBy.some(
                        (readerId) => readerId.toString() === socket.userId
                    )
                ) {
                    message.readBy.push(socket.userId)
                }

                // burn if burn after read
                if (message.isBurnAfterRead) {
                    message.isBurned = true
                    await message.save()
                    await refreshRoomLastMessage(resolvedRoomId)
                    // tell everyone in room to delete this message from UI
                    io.to(resolvedRoomId).emit('message-burned', { messageId })
                } else {
                    await message.save()
                    io.to(resolvedRoomId).emit('message-seen', {
                        messageId,
                        userId: socket.userId
                    })
                }

                await Promise.all(
                    room.members.map((memberId) =>
                        emitChatUpdated(memberId.toString(), resolvedRoomId)
                    )
                )

            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        })

        // ── CALL SIGNALING ─────────────────────────────
        socket.on('call-offer', async ({ to, roomId, offer, callType, callId }) => {
            try {
                if (!to || !roomId || !offer || !callId) {
                    socket.emit('call-error', {
                        callId,
                        message: 'Missing call details'
                    })
                    return
                }

                const room = await Room.findOne({
                    _id: roomId,
                    type: 'direct',
                    members: { $all: [socket.userId, to], $size: 2 }
                }).select('_id members')

                if (!room) {
                    socket.emit('call-error', {
                        callId,
                        message: 'Call is only available between room members'
                    })
                    return
                }

                const targetSockets = io.sockets.adapter.rooms.get(to)
                if (!targetSockets?.size) {
                    socket.emit('call-rejected', {
                        from: to,
                        roomId,
                        callId,
                        reason: 'unavailable'
                    })
                    return
                }

                const timeoutId = setTimeout(() => {
                    const pendingCall = activeCalls.get(callId)
                    if (!pendingCall || pendingCall.status !== 'ringing') return

                    activeCalls.delete(callId)
                    io.to(pendingCall.from).emit('call-rejected', {
                        from: pendingCall.to,
                        roomId: pendingCall.roomId,
                        callId,
                        reason: 'no_answer'
                    })
                    io.to(pendingCall.to).emit('call-ended', {
                        from: pendingCall.from,
                        roomId: pendingCall.roomId,
                        callId,
                        reason: 'no_answer'
                    })
                }, CALL_RING_TIMEOUT_MS)

                activeCalls.set(callId, {
                    roomId: roomId.toString(),
                    from: socket.userId,
                    to,
                    status: 'ringing',
                    startedAt: Date.now(),
                    timeoutId
                })

                io.to(to).emit('call-incoming', {
                    from: socket.userId,
                    roomId,
                    offer,
                    callType: callType === 'video' ? 'video' : 'audio',
                    callId
                })
            } catch (error) {
                socket.emit('call-error', {
                    callId,
                    message: error.message
                })
            }
        })

        socket.on('call-answer', ({ to, roomId, answer, callId }) => {
            const call = activeCalls.get(callId)
            if (!call || call.roomId !== roomId || call.to !== socket.userId) return

            clearTimeout(call.timeoutId)
            call.status = 'active'
            call.timeoutId = null
            activeCalls.set(callId, call)

            io.to(to).emit('call-answered', {
                from: socket.userId,
                roomId,
                answer,
                callId
            })
        })

        socket.on('call-ice-candidate', ({ to, roomId, candidate, callId }) => {
            const call = activeCalls.get(callId)
            if (!call || call.roomId !== roomId) return
            if (![call.from, call.to].includes(socket.userId)) return

            io.to(to).emit('call-ice-candidate', {
                from: socket.userId,
                roomId,
                candidate,
                callId
            })
        })

        socket.on('call-reject', ({ to, roomId, callId, reason = 'rejected' }) => {
            const call = activeCalls.get(callId)
            if (!call || call.roomId !== roomId || call.to !== socket.userId) return

            clearTimeout(call.timeoutId)
            activeCalls.delete(callId)
            io.to(to).emit('call-rejected', {
                from: socket.userId,
                roomId,
                callId,
                reason
            })
        })

        socket.on('call-end', ({ to, roomId, callId, reason = 'ended' }) => {
            const call = activeCalls.get(callId)
            if (call && call.roomId === roomId) {
                clearTimeout(call.timeoutId)
                activeCalls.delete(callId)
            }

            if (to) {
                io.to(to).emit('call-ended', {
                    from: socket.userId,
                    roomId,
                    callId,
                    reason
                })
            }
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
                const lastSeen = new Date()
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen
                })
                socket.broadcast.emit('user-status', {
                    userId: socket.userId,
                    status: 'offline',
                    lastSeen
                })
                console.log(`🔴 User offline: ${socket.userId}`)
            }

            cancelTransfersForUser(socket.userId)
            for (const [callId, call] of activeCalls.entries()) {
                if (call.from !== socket.userId && call.to !== socket.userId) continue

                const peerId = call.from === socket.userId ? call.to : call.from
                io.to(peerId).emit('call-ended', {
                    from: socket.userId,
                    roomId: call.roomId,
                    callId,
                    reason: 'peer_disconnected'
                })
                clearTimeout(call.timeoutId)
                activeCalls.delete(callId)
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

const getSocketToken = (socket) => {
    const authToken = socket.handshake.auth?.token
    if (authToken) return authToken

    const authHeader = socket.handshake.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7)
    }

    const cookieHeader = socket.handshake.headers.cookie || ''
    const tokenCookie = cookieHeader
        .split(';')
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith('token='))

    if (!tokenCookie) return null

    return decodeURIComponent(tokenCookie.slice('token='.length))
}

const emitChatUpdated = async (userId, roomId) => {
    const roomPayload = await buildRoomPayloadForUser(roomId, userId)
    if (!roomPayload) return

    io.to(userId).emit('chat-updated', roomPayload)
}

const buildRoomPayloadForUser = async (roomId, userId) => {
    const room = await Room.findById(roomId)
        .populate('members', 'username displayName avatar isOnline lastSeen')
        .populate('lastMessage.sender', 'username')
        .populate('group', 'name avatar')

    if (!room) return null

    const unreadCount = await Message.countDocuments({
        roomId,
        isBurned: false,
        sender: { $ne: userId },
        readBy: { $ne: userId }
    })

    return {
        ...room.toObject(),
        unreadCount
    }
}

const refreshRoomLastMessage = async (roomId) => {
    const previousVisibleMessage = await Message.findOne({
        roomId,
        isBurned: false
    }).sort({ createdAt: -1 })

    if (!previousVisibleMessage) {
        await Room.findByIdAndUpdate(roomId, {
            lastMessage: {
                content: '',
                sender: null,
                sentAt: null
            }
        })
        return
    }

    await Room.findByIdAndUpdate(roomId, {
        lastMessage: {
            content: previousVisibleMessage.content,
            sender: previousVisibleMessage.sender,
            sentAt: previousVisibleMessage.createdAt
        }
    })
}
