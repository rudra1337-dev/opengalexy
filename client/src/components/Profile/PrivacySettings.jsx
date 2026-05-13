import { useState } from 'react'
import styles from '../../styles/Profile/PrivacySettings.module.css'

export default function PrivacySettings() {
    const [settings, setSettings] = useState({
        showOnlineStatus: true,
        showLastSeen: true,
        allowDirectMessages: true,
        showInSearch: true
    })

    const handleToggle = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const privacyItems = [
        {
            key: 'showOnlineStatus',
            label: '🟢 Show Online Status',
            desc: 'Others can see when you are online'
        },
        {
            key: 'showLastSeen',
            label: '🕒 Show Last Seen',
            desc: 'Others can see your last active time'
        },
        {
            key: 'allowDirectMessages',
            label: '💬 Allow Direct Messages',
            desc: 'Anyone can send you a DM via @username'
        },
        {
            key: 'showInSearch',
            label: '🔍 Appear in Search',
            desc: 'Others can find you by searching @username'
        }
    ]

    return (
        <div className="flex flex-col gap-2">
            <h3
                className="text-xs font-semibold uppercase tracking-wider px-1 mb-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Privacy
            </h3>

            <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-color)' }}
            >
                {privacyItems.map((item, index) => (
                    <div
                        key={item.key}
                        className="flex items-center justify-between px-4 py-3"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderBottom:
                                index < privacyItems.length - 1
                                    ? '1px solid var(--border-color)'
                                    : 'none'
                        }}
                    >
                        <div className="flex-1 min-w-0 mr-4">
                            <div
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {item.label}
                            </div>
                            <div
                                className="text-xs mt-0.5"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                {item.desc}
                            </div>
                        </div>

                        <button
                            type="button"
                            className={`${styles.toggle} ${settings[item.key] ? styles.on : ''}`}
                            onClick={() => handleToggle(item.key)}
                        >
                            <div className={styles.toggleSlider}></div>
                        </button>
                    </div>
                ))}
            </div>

            {/* Info box */}
            <div className={`${styles.infoBox} p-3 mt-2`}>
                <p className={styles.infoText}>
                    ℹ️ Privacy settings are local for now — full implementation
                    coming in a future update.
                </p>
            </div>
        </div>
    )
}
