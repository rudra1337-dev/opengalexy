import styles from '../../styles/Calls/CallControls.module.css'

export default function CallControls({
    callType,
    isMuted,
    isCameraOff,
    onToggleMute,
    onToggleCamera,
    onEnd
}) {
    return (
        <div className={styles.controls} aria-label="Call controls">
            <button
                type="button"
                className={`${styles.controlButton} ${isMuted ? styles.active : ''}`}
                onClick={onToggleMute}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
                {isMuted ? 'Mic off' : 'Mic'}
            </button>

            {callType === 'video' && (
                <button
                    type="button"
                    className={`${styles.controlButton} ${isCameraOff ? styles.active : ''}`}
                    onClick={onToggleCamera}
                    title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                >
                    {isCameraOff ? 'Cam off' : 'Cam'}
                </button>
            )}

            <button
                type="button"
                className={`${styles.controlButton} ${styles.endButton}`}
                onClick={onEnd}
                title="End call"
            >
                End
            </button>
        </div>
    )
}
