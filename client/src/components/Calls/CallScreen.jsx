import { useState } from 'react'
import { useSelector } from 'react-redux'
import { formatRelativeTime } from '../../utils/formatters'
import styles from '../../styles/Calls/CallScreen.module.css'

const callTypes = ['All', 'Missed', 'Video']

export default function CallScreen({ mode = 'history' }) {
    const { chatList } = useSelector((state) => state.chats)
    const { user } = useSelector((state) => state.auth)
    const [activeFilter, setActiveFilter] = useState('All')

    const callEntries = chatList.slice(0, 8).map((chat, index) => {
        const contact =
            chat.members?.find((member) => member._id !== user?._id) ||
            chat.members?.[0]
        return {
            id: chat._id,
            name:
                contact?.displayName ||
                contact?.username ||
                'OpenGalexy contact',
            direction:
                index % 3 === 0
                    ? 'Missed'
                    : index % 2 === 0
                      ? 'Outgoing'
                      : 'Incoming',
            type: index % 2 === 0 ? 'Voice' : 'Video',
            time: chat.updatedAt || new Date().toISOString()
        }
    })

    const filteredCalls = callEntries.filter((call) => {
        if (activeFilter === 'Missed') return call.direction === 'Missed'
        if (activeFilter === 'Video') return call.type === 'Video'
        return true
    })

    if (mode === 'details') {
        return (
            <div className={styles.detailPanel}>
                <div className={styles.heroCard}>
                    <div className={styles.heroBadge}>Call Hub</div>
                    <h2>Voice and video, right from your conversations</h2>
                    <p>
                        Recent call history will grow here as the calling flow
                        matures. For now, this panel gives you a polished launch
                        surface tied to the people already in your chats.
                    </p>
                </div>

                <div className={styles.insightGrid}>
                    <div className={styles.insightCard}>
                        <span>Recent contacts</span>
                        <strong>{chatList.length}</strong>
                    </div>
                    <div className={styles.insightCard}>
                        <span>Quick actions</span>
                        <strong>Voice, video, return calls</strong>
                    </div>
                    <div className={styles.insightCard}>
                        <span>Status</span>
                        <strong>Ready for UI integration</strong>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p className={styles.eyebrow}>Calling</p>
                <h2>Recent Calls</h2>
                <p>WhatsApp-inspired call history, tuned for OpenGalexy.</p>
            </div>

            <div className={styles.searchShell}>
                <input
                    className={styles.searchInput}
                    placeholder="Search recent calls"
                />
            </div>

            <div className={styles.filters}>
                {callTypes.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        className={`${styles.filterChip} ${activeFilter === filter ? styles.filterChipActive : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className={styles.callList}>
                {filteredCalls.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span>📞</span>
                        <p>Your call history will appear here.</p>
                    </div>
                ) : (
                    filteredCalls.map((call) => (
                        <div key={call.id} className={styles.callCard}>
                            <div className={styles.callAvatar}>
                                {call.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.callContent}>
                                <strong>{call.name}</strong>
                                <span
                                    className={
                                        call.direction === 'Missed'
                                            ? styles.missed
                                            : ''
                                    }
                                >
                                    {call.direction} · {call.type}
                                </span>
                                <small>{formatRelativeTime(call.time)}</small>
                            </div>
                            <button type="button" className={styles.callAction}>
                                {call.type === 'Video' ? '📹' : '📞'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button
                type="button"
                className={styles.fab}
                title="Start a new call"
            >
                +
            </button>
        </div>
    )
}
