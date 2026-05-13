import api from './api'

export const chatService = {
    // Get all rooms for current user
    getUserRooms: () => api.get('/rooms'),

    // Get or create direct room with someone
    getOrCreateDirectRoom: (username) =>
        api.post('/rooms/direct', { username }),

    // Get single room
    getRoom: (roomId) => api.get(`/rooms/${roomId}`),

    // Get messages from a room (paginated)
    getMessages: (roomId, page = 1, limit = 30) =>
        api.get(`/messages/${roomId}?page=${page}&limit=${limit}`),

    // Send a message
    sendMessage: (roomId, data) => api.post(`/messages/${roomId}`, data),

    // Mark message as read
    markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),

    // Set room as temporary
    setRoomTemp: (roomId, duration) =>
        api.patch(`/rooms/${roomId}/temp`, { duration })
}
