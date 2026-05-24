import styles from '../../styles/NearbyShare/NearbyDeviceList.module.css'

export default function NearbyDeviceList({
    devices,
    isScanning,
    selectedDeviceId,
    onSelectDevice,
    onSendToDevice,
    selectedFile
}) {
    if (devices.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    {isScanning ? '🛰️' : '📡'}
                </div>
                <div className={styles.emptyTitle}>
                    {isScanning ? 'Looking for nearby devices' : 'No devices found'}
                </div>
                <div className={styles.emptyText}>
                    {isScanning
                        ? 'Keep this screen open while we look for people who are live right now.'
                        : 'Ask the other person to open Nearby Share so they appear here.'}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {devices.map((device) => {
                const isSelected = selectedDeviceId === device.userId

                return (
                    <article
                        key={device.userId}
                        className={`${styles.deviceCard} ${isSelected ? styles.deviceCardSelected : ''}`}
                        onClick={() => onSelectDevice(device.userId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                onSelectDevice(device.userId)
                            }
                        }}
                    >
                        <div className={styles.deviceMain}>
                            <div className={styles.avatar}>
                                {device.username?.charAt(0).toUpperCase()}
                            </div>

                            <div className={styles.deviceInfo}>
                                <div className={styles.deviceNameRow}>
                                    <strong>@{device.username}</strong>
                                    {isSelected ? (
                                        <span className={styles.selectionBadge}>
                                            Selected
                                        </span>
                                    ) : null}
                                </div>

                                <div className={styles.deviceMeta}>
                                    <span className={styles.deviceStatusDot}></span>
                                    <span>Live now</span>
                                    <span className={styles.deviceDivider}>•</span>
                                    <span>Ready for requests</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.deviceActions}>
                            <span className={styles.deviceHint}>
                                {selectedFile
                                    ? 'Ready to send'
                                    : 'Select a file first'}
                            </span>
                            <button
                                type="button"
                                className={`${styles.sendBtn} ${!selectedFile ? styles.sendBtnDisabled : ''}`}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    if (!selectedFile) return
                                    onSendToDevice(device)
                                }}
                                disabled={!selectedFile}
                            >
                                Send now
                            </button>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
