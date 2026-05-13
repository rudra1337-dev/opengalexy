import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

let socket = null

export const initSocket = (userId) => {
    socket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    })

    socket.on('connect', () => {
        console.log('⚡ Socket connected:', socket.id)
        socket.emit('user-online', userId)
    })

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
    })

    return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
