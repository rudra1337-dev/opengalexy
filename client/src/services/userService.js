import api from './api'

export const userService = {
    // Search users by username
    searchUsers: (query) => api.get(`/users/search?q=${query}`),

    // Get user by username
    getUserByUsername: (username) => api.get(`/users/${username}`)
}
