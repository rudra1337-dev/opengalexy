import { useSelector } from 'react-redux'
import styles from '../../styles/NearbyShare/NearbyScreen.module.css'

const devicePreview = [
    {
        id: 1,
        name: 'Rhea’s MacBook Air',
        status: 'Ready to receive',
        distance: '2 m away',
        icon: '💻'
    },
    {
        id: 2,
        name: 'Studio Pixel 9',
        status: 'Visible to contacts',
        distance: '4 m away',
        icon: '📱'
    },
    {
        id: 3,
        name: 'OpenGalexy Tab',
        status: 'Waiting for files',
        distance: '7 m away',
        icon: '🛰️'
    }
]

export default function NearbyScreen({ mode = 'devices' }) {
    const { user } = useSelector((state) => state.auth)

    if (mode === 'details') {
        return (
            <div className={styles.detailPanel}>
                <div className={styles.heroCard}>
                    <div className={styles.heroBadge}>Nearby Share</div>
                    <h2>Send files around you in seconds</h2>
                    <p>
                        OpenGalexy nearby sessions stay local-first, fast, and
                        familiar. Pick a device from the middle column to start
                        a transfer when the realtime flow is connected.
                    </p>
                </div>

                <div className={styles.detailGrid}>
                    <div className={styles.statCard}>
                        <span>Visibility</span>
                        <strong>
                            {user?.username
                                ? 'Contacts + groups'
                                : 'Guest preview mode'}
                        </strong>
                    </div>
                    <div className={styles.statCard}>
                        <span>Security</span>
                        <strong>Consent required</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span>Best for</span>
                        <strong>Photos, docs, quick drops</strong>
                    </div>
                </div>

                <div className={styles.timelineCard}>
                    <h3>How it will feel</h3>
                    <div className={styles.timelineStep}>
                        <span>1</span>
                        <div>
                            <strong>Discover</strong>
                            <p>
                                See nearby devices as soon as they become
                                available.
                            </p>
                        </div>
                    </div>
                    <div className={styles.timelineStep}>
                        <span>2</span>
                        <div>
                            <strong>Confirm</strong>
                            <p>
                                Accept the connection before any file starts
                                moving.
                            </p>
                        </div>
                    </div>
                    <div className={styles.timelineStep}>
                        <span>3</span>
                        <div>
                            <strong>Transfer</strong>
                            <p>
                                Watch progress, cancel safely, and keep your
                                chat open.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p className={styles.eyebrow}>Nearby</p>
                <h2>Ready Devices</h2>
                <p>
                    When the nearby session is active, compatible devices will
                    appear here.
                </p>
            </div>

            <div className={styles.quickActions}>
                <button type="button" className={styles.actionButton}>
                    Scan again
                </button>
                <button type="button" className={styles.actionButtonSecondary}>
                    Visibility
                </button>
            </div>

            <div className={styles.deviceList}>
                {devicePreview.map((device) => (
                    <button
                        key={device.id}
                        type="button"
                        className={styles.deviceCard}
                    >
                        <div className={styles.deviceIcon}>{device.icon}</div>
                        <div className={styles.deviceContent}>
                            <strong>{device.name}</strong>
                            <span>{device.status}</span>
                            <small>{device.distance}</small>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
