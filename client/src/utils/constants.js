export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
export const WEBRTC_ICE_SERVERS = parseIceServers(
    import.meta.env.VITE_WEBRTC_ICE_SERVERS
)
export const WEBRTC_DEBUG = import.meta.env.VITE_WEBRTC_DEBUG === 'true'

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

function parseIceServers(rawValue) {
    if (!rawValue) {
        // TODO: This fallback is STUN-only, so Nearby Share depends on direct
        // host/srflx connectivity. Add real TURN relay credentials for
        // production when cross-network reliability becomes a priority.
        return [{ urls: 'stun:stun.l.google.com:19302' }]
    }

    try {
        const parsedValue = JSON.parse(rawValue)

        if (
            Array.isArray(parsedValue) &&
            parsedValue.every(
                (entry) =>
                    entry &&
                    (typeof entry.urls === 'string' ||
                        (Array.isArray(entry.urls) &&
                            entry.urls.every((url) => typeof url === 'string')))
            )
        ) {
            return parsedValue
        }
    } catch (error) {
        console.warn('Invalid VITE_WEBRTC_ICE_SERVERS value. Falling back to STUN.', error)
    }

    // TODO: Same limitation as above: falling back to STUN keeps behavior
    // simple for now, but hotspot-provider peers and restrictive NATs may need
    // TURN relay candidates to connect reliably.
    return [{ urls: 'stun:stun.l.google.com:19302' }]
}
