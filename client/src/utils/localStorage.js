// Auth token
export const setAuthToken = (token) => {
    localStorage.setItem('auth_token', token)
}

export const getAuthToken = () => {
    return localStorage.getItem('auth_token')
}

export const removeAuthToken = () => {
    localStorage.removeItem('auth_token')
}

// User preferences
export const setUserPreferences = (prefs) => {
    localStorage.setItem('user_prefs', JSON.stringify(prefs))
}

export const getUserPreferences = () => {
    const prefs = localStorage.getItem('user_prefs')
    return prefs ? JSON.parse(prefs) : {}
}

// Last active chat
export const setLastActiveChat = (roomId) => {
    localStorage.setItem('last_active_chat', roomId)
}

export const getLastActiveChat = () => {
    return localStorage.getItem('last_active_chat')
}
