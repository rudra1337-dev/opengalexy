export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

// Duration options for temp messages
export const TEMP_DURATIONS = {
    '5m': '5 minutes',
    '1h': '1 hour',
    '24h': '1 day',
    '7d': '7 days',
    '30d': '30 days'
}

// Message types
export const MESSAGE_TYPES = {
    TEXT: 'text',
    FILE: 'file',
    IMAGE: 'image'
}

// App routes
export const ROUTES = {
    LANDING: '/',
    ONBOARDING: '/onboarding',
    HOME: '/home',
    CHATS: '/home/chats',
    GROUPS: '/home/groups',
    NEARBY: '/home/nearby',
    PROFILE: '/home/profile',
    CALL: '/call/:roomId',
    NOT_FOUND: '/404'
}

// Call types
export const CALL_TYPES = {
    AUDIO: 'audio',
    VIDEO: 'video'
}
