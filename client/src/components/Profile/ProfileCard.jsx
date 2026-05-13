import { useState } from 'react'
import { useSelector } from 'react-redux'
import styles from '../../styles/Profile/ProfileCard.module.css'

export default function ProfileCard() {
    const { user } = useSelector((state) => state.auth)
    const [copied, setCopied] = useState(false)

    const handleCopyId = () => {
        navigator.clipboard.writeText(`@${user?.username}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!user) return null

    return (
        <div className="flex flex-col items-center py-8 px-6">
            {/* Avatar */}
            <div className="relative mb-4">
                <div
                    className={`${styles.avatar} w-24 h-24 rounded-full flex items-center justify-center`}
                >
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
                {/* Online badge */}
                <div
                    className={`${styles.onlineBadge} absolute bottom-1 right-1 w-4 h-4 rounded-full`}
                ></div>
            </div>

            {/* Name */}
            <h2
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
            >
                {user.displayName}
            </h2>

            {/* Username + copy */}
            <div className="flex items-center gap-2 mb-6">
                <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--accent-primary)' }}
                >
                    @{user.username}
                </span>
                <button
                    onClick={handleCopyId}
                    className={`${styles.copyBtn} ${copied ? styles.copied : ''} px-2 py-0.5 rounded-md text-xs cursor-pointer`}
                >
                    {copied ? '✓ Copied!' : 'Copy ID'}
                </button>
            </div>

            {/* Stats row */}
            <div
                className="w-full flex items-center justify-around py-4 rounded-xl"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {user.usernameSet ? '✓' : '✕'}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Verified
                    </span>
                </div>
                <div
                    className="w-px h-8"
                    style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {user.isTemp ? '⏱' : '♾️'}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Account
                    </span>
                </div>
                <div
                    className="w-px h-8"
                    style={{ backgroundColor: 'var(--border-color)' }}
                ></div>
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {user.burnAfterRead ? '🔥' : '💬'}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Burn
                    </span>
                </div>
            </div>
        </div>
    )
}
