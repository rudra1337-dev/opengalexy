// Validate username
export const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/

    if (!username) {
        return { valid: false, error: 'Username is required' }
    }

    if (username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' }
    }

    if (username.length > 20) {
        return { valid: false, error: 'Username must be at most 20 characters' }
    }

    if (!regex.test(username)) {
        return {
            valid: false,
            error: 'Username can only contain letters, numbers and underscores'
        }
    }

    return { valid: true }
}

// Validate email
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

// Validate message
export const validateMessage = (content) => {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Message cannot be empty' }
    }

    if (content.length > 2000) {
        return {
            valid: false,
            error: 'Message is too long (max 2000 characters)'
        }
    }

    return { valid: true }
}
