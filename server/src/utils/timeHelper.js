// takes a string like '5m', '1h', '24h', '7d' and returns a future Date
const getExpiryDate = (duration) => {
    const now = new Date()

    const map = {
        '5m': 5 * 60 * 1000,
        '1h': 1 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    }

    if (!map[duration]) return null  // null = permanent

    return new Date(now.getTime() + map[duration])
}

export { getExpiryDate }