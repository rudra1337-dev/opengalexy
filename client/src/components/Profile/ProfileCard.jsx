import { useState } from 'react'
import { useSelector } from 'react-redux'
import styles from '../../styles/Profile/ProfileCard.module.css'

export default function ProfileCard() {
    const { user, sessionMode } = useSelector((state) => state.auth)
    const [copied, setCopied] = useState(false)

    const handleCopyId = () => {
        navigator.clipboard.writeText(`@${user?.username}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!user) return null

    return (
        <div className={styles.card}>
            <div className={styles.identityBlock}>
                <div className={styles.avatarShell}>
                    <div className={styles.avatar}>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.displayName}
                                className={styles.avatarImg}
                            />
                        ) : (
                            user.displayName?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className={styles.onlineBadge}></div>
                </div>

                <div className={styles.identityCopy}>
                    <p className={styles.overline}>Profile snapshot</p>
                    <h2 className={styles.name}>{user.displayName}</h2>
                    <div className={styles.handleRow}>
                        <span className={styles.handle}>@{user.username}</span>
                        <button
                            onClick={handleCopyId}
                            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                        >
                            {copied ? 'Copied' : 'Copy ID'}
                        </button>
                    </div>

                    <div className={styles.badgeRow}>
                        <span className={styles.badge}>
                            {sessionMode === 'guest'
                                ? 'Guest mode'
                                : 'Signed in'}
                        </span>
                        <span className={styles.badge}>
                            {user.defaultMessageMode === 'temp'
                                ? 'Temp by default'
                                : 'Permanent by default'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.statGrid}>
                <article className={styles.statCard}>
                    <span className={styles.statValue}>
                        {user.usernameSet ? 'Verified' : 'Pending'}
                    </span>
                    <span className={styles.statLabel}>Username state</span>
                </article>
                <article className={styles.statCard}>
                    <span className={styles.statValue}>
                        {user.isTemp ? 'Temporary' : 'Persistent'}
                    </span>
                    <span className={styles.statLabel}>Account mode</span>
                </article>
                <article className={styles.statCard}>
                    <span className={styles.statValue}>
                        {user.burnAfterRead ? 'Enabled' : 'Off'}
                    </span>
                    <span className={styles.statLabel}>Burn after read</span>
                </article>
            </div>

            <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Email</span>
                    <span className={styles.metaValue}>{user.email}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Message mode</span>
                    <span className={styles.metaValue}>
                        {user.defaultMessageMode === 'temp'
                            ? 'Temporary first'
                            : 'Permanent first'}
                    </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Session</span>
                    <span className={styles.metaValue}>
                        {sessionMode === 'guest'
                            ? 'Guest browsing'
                            : 'Protected by Google sign-in'}
                    </span>
                </div>
            </div>
        </div>
    )
}
