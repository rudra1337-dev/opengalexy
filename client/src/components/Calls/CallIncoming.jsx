import styles from '../../styles/Calls/CallIncoming.module.css'

export default function CallIncoming({ call, onAccept, onReject }) {
    if (!call) return null

    const callerName =
        call.caller?.displayName ||
        call.caller?.username ||
        call.fromName ||
        'OpenGalexy contact'

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                <div className={styles.avatar}>
                    {callerName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.copy}>
                    <span>Incoming {call.callType === 'video' ? 'video' : 'voice'} call</span>
                    <h2>{callerName}</h2>
                    <p>Answer to start a secure peer-to-peer call.</p>
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.reject}
                        onClick={onReject}
                    >
                        Decline
                    </button>
                    <button
                        type="button"
                        className={styles.accept}
                        onClick={onAccept}
                    >
                        Answer
                    </button>
                </div>
            </div>
        </div>
    )
}
