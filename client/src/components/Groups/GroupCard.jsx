import { useSelector } from 'react-redux'
import styles from '../../styles/Groups/GroupCard.module.css'

export default function GroupCard({
    group,
    isActive,
    onClick,
    onJoin,
    isPublicView
}) {
    const { user } = useSelector((state) => state.auth)
    const isAdmin = group.members?.some(
        (member) =>
            (member.user === user?._id || member.user?._id === user?._id) &&
            member.role === 'admin'
    )

    return (
        <button
            type="button"
            className={`${styles.card} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <div className={styles.avatar}>
                {group.name?.charAt(0).toUpperCase()}
            </div>

            <div className={styles.info}>
                <div className={styles.header}>
                    <div className={styles.name}>{group.name}</div>
                    <div className={styles.badges}>
                        {group.isPublic && (
                            <span
                                className={`${styles.badge} ${styles.publicBadge}`}
                            >
                                Public
                            </span>
                        )}
                        {group.isTemp && (
                            <span
                                className={`${styles.badge} ${styles.tempBadge}`}
                            >
                                Temp
                            </span>
                        )}
                        {isAdmin && (
                            <span
                                className={`${styles.badge} ${styles.adminBadge}`}
                            >
                                Admin
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.meta}>
                    <span className={styles.members}>
                        👥 {group.members?.length || 0} members
                    </span>
                    {isPublicView ? (
                        <button
                            className={styles.joinBtn}
                            onClick={(e) => {
                                e.stopPropagation()
                                onJoin(group.inviteCode)
                            }}
                        >
                            Join
                        </button>
                    ) : (
                        <span className={styles.lastMessage}>
                            {group.room?.lastMessage?.content ||
                                'No messages yet'}
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}
