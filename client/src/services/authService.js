import api from './api'

export const authService = {
    // Get current user
    getMe: () => api.get('/auth/me'),

    // Check username availability
    checkUsername: (username) => api.get(`/auth/check-username/${username}`),

    // Set username during onboarding
    setUsername: (username) => api.post('/auth/set-username', { username }),

    // Logout
    logout: () => api.post('/auth/logout')
}
