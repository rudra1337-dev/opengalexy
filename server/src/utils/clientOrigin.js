const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1'])

const normalizeOrigin = (value) => {
    if (!value || typeof value !== 'string') return null

    try {
        return new URL(value).origin
    } catch {
        return null
    }
}

const getConfiguredClientOrigins = () => {
    const rawOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
        .filter(Boolean)
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean)

    return [...new Set(rawOrigins.map(normalizeOrigin).filter(Boolean))]
}

const isTrustedPreviewOrigin = (origin) => {
    const normalizedOrigin = normalizeOrigin(origin)
    if (!normalizedOrigin) return false

    const { protocol, hostname } = new URL(normalizedOrigin)

    if (protocol === 'http:' && LOCALHOST_HOSTS.has(hostname)) {
        return true
    }

    return protocol === 'https:' && hostname.endsWith('.vercel.app')
}

const resolveClientOrigin = (requestedOrigin) => {
    const configuredOrigins = getConfiguredClientOrigins()
    const normalizedRequestedOrigin = normalizeOrigin(requestedOrigin)

    if (
        normalizedRequestedOrigin &&
        (configuredOrigins.includes(normalizedRequestedOrigin) ||
            isTrustedPreviewOrigin(normalizedRequestedOrigin))
    ) {
        return normalizedRequestedOrigin
    }

    return configuredOrigins[0] || null
}

const corsOriginDelegate = (origin, callback) => {
    if (!origin) {
        callback(null, true)
        return
    }

    const configuredOrigins = getConfiguredClientOrigins()

    if (
        configuredOrigins.length === 0 ||
        configuredOrigins.includes(normalizeOrigin(origin))
    ) {
        callback(null, true)
        return
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`))
}

export { getConfiguredClientOrigins, resolveClientOrigin, corsOriginDelegate }
