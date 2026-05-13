import { formatTime, calculateTimeRemaining } from '../../utils/formatters'
import styles from '../../styles/Chats/MessageBubble.module.css'

export default function MessageBubble({ message, isSent }) {
    const isTempMessage = message.isTemp && message.expiresAt
    const timeRemaining = isTempMessage
        ? calculateTimeRemaining(message.expiresAt)
        : null
    const isRead = message.readBy?.length > 0

    return (
        <div
            className={`${styles.row} ${isSent ? styles.sent : styles.received}`}
        >
            <div
                className={`${styles.bubble} ${
                    isSent ? styles.bubbleSent : styles.bubbleReceived
                } ${isTempMessage ? styles.bubbleTemp : ''}`}
            >
                <div className={styles.content}>{message.content}</div>

                <div className={styles.footer}>
                    <span className={styles.time}>
                        {formatTime(message.createdAt)}
                    </span>
                    {isSent && isRead && <span className={styles.read}></span>}
                    {isTempMessage && (
                        <span className={styles.timer}>⏱ {timeRemaining}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
