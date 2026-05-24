import styles from '../../styles/NearbyShare/TransferProgress.module.css'

export default function TransferProgress({ transfers }) {
    if (!transfers || transfers.length === 0) return null

    return (
        <div className={styles.list}>
            {transfers.map((transfer) => (
                <article key={transfer.id} className={styles.transferCard}>
                    <div className={styles.transferHeader}>
                        <div className={styles.transferLead}>
                            <div className={styles.transferIcon}>
                                {getTransferIcon(transfer.status)}
                            </div>
                            <div className={styles.transferInfo}>
                                <strong className={styles.fileName}>
                                    {transfer.fileName}
                                </strong>
                                <span className={styles.peerMeta}>
                                    {getPeerLabel(transfer)}
                                </span>
                            </div>
                        </div>

                        <span
                            className={`${styles.statusBadge} ${getStatusStyle(transfer.status)}`}
                        >
                            {getStatusLabel(transfer.status)}
                        </span>
                    </div>

                    {(transfer.status === 'sending' ||
                        transfer.status === 'receiving') && (
                        <div className={styles.progressTrack}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${transfer.progress || 0}%` }}
                            />
                        </div>
                    )}

                    <div className={styles.metaRow}>
                        <span className={styles.metaText}>
                            {transfer.fileSize
                                ? formatBytes(transfer.fileSize)
                                : 'Preparing transfer'}
                        </span>
                        <span className={styles.metaText}>
                            {transfer.status === 'sending' ||
                            transfer.status === 'receiving'
                                ? `${transfer.progress || 0}%`
                                : transfer.status === 'done'
                                  ? '100%'
                                  : 'Retry needed'}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    )
}

const getStatusStyle = (status) => {
    const map = {
        requesting: styles.statusRequesting,
        connecting: styles.statusConnecting,
        sending: styles.statusSending,
        receiving: styles.statusReceiving,
        done: styles.statusDone,
        failed: styles.statusFailed,
        declined: styles.statusDeclined,
        cancelled: styles.statusCancelled
    }
    return map[status] || ''
}

const getStatusLabel = (status) => {
    const map = {
        requesting: 'Waiting approval',
        connecting: 'Connecting',
        sending: 'Sending',
        receiving: 'Receiving',
        done: 'Complete',
        failed: 'Failed',
        declined: 'Declined',
        cancelled: 'Cancelled'
    }
    return map[status] || status
}

const getTransferIcon = (status) => {
    const map = {
        requesting: '…',
        connecting: '⟳',
        sending: '↑',
        receiving: '↓',
        done: '✓',
        failed: '!',
        declined: '×',
        cancelled: '•'
    }
    return map[status] || '•'
}

const getPeerLabel = (transfer) => {
    if (!transfer.peerUsername) return 'Waiting for recipient'
    if (transfer.direction === 'incoming') return `From @${transfer.peerUsername}`
    return `To @${transfer.peerUsername}`
}

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
