import { Server } from 'socket.io'

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

        socket.on('join-room', (roomId) => {
            socket.join(roomId)
            console.log(`👤 ${socket.id} joined room ${roomId}`)
        })

        socket.on('send-message', (data) => {
            io.to(data.roomId).emit('message-received', data)
        })

        socket.on('user-online', (userId) => {
            socket.broadcast.emit('user-status', { userId, status: 'online' })
        })

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`)
        })
    })
}

const getIO = () => io

export { initSocket, getIO }