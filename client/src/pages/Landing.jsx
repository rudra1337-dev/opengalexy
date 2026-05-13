import GoogleLoginBtn from '../components/Auth/GoogleLoginBtn'
import ThemeToggle from '../components/Layout/ThemeToggle'
import styles from '../styles/pages/Landing.module.css'

export default function Landing() {
    return (
        <div className={styles.container}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <ThemeToggle />
            </div>

            <div className={styles.content}>
                <div className={styles.logo}>🌌</div>

                <h1 className={styles.title}>OpenGalexy</h1>

                <p className={styles.subtitle}>
                    Messages that live or die on your terms. Chat without the
                    clutter.
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>⏱️</div>
                        <div className={styles.featureTitle}>
                            Temporary Messages
                        </div>
                        <div className={styles.featureDesc}>
                            Messages that auto-delete
                        </div>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>🔥</div>
                        <div className={styles.featureTitle}>
                            Burn After Read
                        </div>
                        <div className={styles.featureDesc}>
                            Vanish instantly after opening
                        </div>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📡</div>
                        <div className={styles.featureTitle}>Nearby Share</div>
                        <div className={styles.featureDesc}>
                            Fast peer-to-peer file sharing
                        </div>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📞</div>
                        <div className={styles.featureTitle}>Voice & Video</div>
                        <div className={styles.featureDesc}>
                            Built-in WebRTC calls
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <GoogleLoginBtn />
                </div>
            </div>
        </div>
    )
}
