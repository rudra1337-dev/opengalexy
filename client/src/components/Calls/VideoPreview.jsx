import { useEffect, useRef } from 'react'
import styles from '../../styles/Calls/VideoPreview.module.css'

export default function VideoPreview({
    stream,
    muted = false,
    label,
    name,
    isLocal = false,
    cameraOff = false,
    compact = false,
    connectionState
}) {
    const videoRef = useRef(null)
    const hasVideo = Boolean(stream?.getVideoTracks().length) && !cameraOff

    useEffect(() => {
        if (!videoRef.current) return
        videoRef.current.srcObject = stream || null
    }, [stream])

    return (
        <div className={`${styles.tile} ${compact ? styles.compact : ''}`}>
            {hasVideo ? (
                <video
                    ref={videoRef}
                    className={styles.video}
                    autoPlay
                    playsInline
                    muted={muted}
                />
            ) : (
                <div className={styles.avatarStage}>
                    <div className={styles.avatar}>
                        {(name || label || '?').charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            <div className={styles.overlay}>
                <span>{label}</span>
                {isLocal && <strong>You</strong>}
                {connectionState && <small>{connectionState}</small>}
            </div>
        </div>
    )
}
