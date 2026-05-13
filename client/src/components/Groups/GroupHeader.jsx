import styles from '../../styles/Groups/GroupHeader.module.css'

export default function GroupHeader({ group, onSettings, onSearch, onBack }) {
    if (!group) return null

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBack}
                    title="Back to groups"
                >
                    ←
                </button>
                <div className={styles.avatar}>
                    {group.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{group.name}</div>
                    <div className={styles.meta}>
                        <span>👥 {group.members?.length || 0} members</span>
                        {group.isPublic && (
                            <span className={styles.publicTag}>Public</span>
                        )}
                        {group.isTemp && (
                            <span
                                style={{
                                    color: 'var(--warning-color)',
                                    fontSize: '11px'
                                }}
                            >
                                ⏱ Temp
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <button
                    type="button"
                    className={styles.button}
                    onClick={onSearch}
                    title="Search messages"
                >
                    🔍
                </button>
                <button
                    type="button"
                    className={styles.button}
                    onClick={onSettings}
                    title="Group settings"
                >
                    ⚙️
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
