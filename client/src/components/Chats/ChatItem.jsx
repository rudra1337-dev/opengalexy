import { useSelector } from 'react-redux'
import { formatTime } from '../../utils/formatters'
import styles from '../../styles/Chats/ChatItem.module.css'

export default function ChatItem({ chat, isActive, onClick }) {
    const { user } = useSelector((state) => state.auth)
    const otherUser = chat.members?.find((member) => member._id !== user?._id)
    const lastMessage =
        chat.lastMessage?.content || 'Tap to start your conversation'
    const unreadCount = chat.unreadCount || 0
    const statusLabel = otherUser?.isOnline
        ? 'Online'
        : otherUser?.lastSeen
          ? `Seen ${new Date(otherUser.lastSeen).toLocaleDateString()}`
          : 'Offline'

    return (
        <button
            type="button"
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <div className={styles.avatar}>
                {otherUser?.displayName?.charAt(0)?.toUpperCase() ||
                    otherUser?.username?.charAt(0)?.toUpperCase() ||
                    '?'}
                {otherUser?.isOnline && (
                    <div className={styles.onlineBadge}></div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.name}>
                        {otherUser?.displayName ||
                            `@${otherUser?.username || 'unknown'}`}
                    </div>
                    <div className={styles.time}>
                        {chat.updatedAt ? formatTime(chat.updatedAt) : ''}
                    </div>
                </div>
                <div className={styles.metaRow}>
                    <div className={styles.message}>{lastMessage}</div>
                    <div className={styles.status}>{statusLabel}</div>
                </div>
            </div>

            {unreadCount > 0 && (
                <div className={styles.unread}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </button>
    )
}
