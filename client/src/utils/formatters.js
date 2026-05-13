// Format timestamp to readable time
export const formatTime = (date) => {
    const d = new Date(date)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

// Format date nicely
export const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()

    if (d.toDateString() === today.toDateString()) {
        return 'Today'
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
    }

    return d.toLocaleDateString()
}

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    }

    for (const [name, secondsIn] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsIn)
        if (interval >= 1) {
            return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`
        }
    }

    return 'just now'
}

// Calculate remaining time till expiry
export const calculateTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
}
