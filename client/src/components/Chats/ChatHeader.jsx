import { useSelector } from 'react-redux'
import { formatRelativeTime } from '../../utils/formatters'
import styles from '../../styles/Chats/ChatHeader.module.css'

export default function ChatHeader({ chat, onCall, onBack }) {
    const { user } = useSelector((state) => state.auth)

    if (!chat) return null

    const otherUser = chat.members?.find((member) => member._id !== user?._id)
    const statusText = otherUser?.isOnline
        ? 'Online now'
        : otherUser?.lastSeen
          ? `Last seen ${formatRelativeTime(otherUser.lastSeen)}`
          : 'Away from keyboard'

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBack}
                    title="Back to conversations"
                >
                    ←
                </button>
                <div className={styles.avatar}>
                    {otherUser?.displayName?.charAt(0)?.toUpperCase() ||
                        otherUser?.username?.charAt(0)?.toUpperCase() ||
                        '?'}
                    {otherUser?.isOnline && (
                        <div className={styles.onlineBadge}></div>
                    )}
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>
                        {otherUser?.displayName || `@${otherUser?.username}`}
                    </div>
                    <div className={styles.status}>{statusText}</div>
                </div>
            </div>

            <div className={styles.right}>
                <button
                    type="button"
                    className={styles.button}
                    onClick={() => onCall('audio')}
                    title="Start voice call"
                >
                    📞
                </button>
                <button
                    type="button"
                    className={styles.button}
                    onClick={() => onCall('video')}
                    title="Start video call"
                >
                    📹
                </button>
                <button
                    type="button"
                    className={styles.button}
                    title="More actions coming soon"
                >
                    ⋯
                </button>
            </div>
        </div>
    )
}
