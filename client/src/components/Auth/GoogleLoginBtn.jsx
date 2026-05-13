import { useNavigate } from 'react-router-dom'
import styles from '../../styles/Auth/GoogleLoginBtn.module.css'

export default function GoogleLoginBtn() {
    const navigate = useNavigate()
    const API_URL = import.meta.env.VITE_API_BASE_URL

    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth
        window.location.href = `${API_URL.replace('/api', '')}/api/auth/google`
    }

    const handleGuestBrowse = () => {
        navigate('/home')
    }

    return (
        <div className={styles.container}>
            <button onClick={handleGoogleLogin} className={styles.btn}>
                <span className={styles.icon}>🅶</span>
                Continue with Google
            </button>

            <div className={styles.divider}>
                <span className={styles.dividerText}>or</span>
            </div>

            <button
                onClick={handleGuestBrowse}
                className={styles.btn}
                style={{ opacity: 0.7 }}
            >
                <span className={styles.icon}>👁️</span>
                Browse as Guest
            </button>

            <p
                style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    marginTop: '8px'
                }}
            >
                No account? Sign in with Google to get started
            </p>
        </div>
    )
}
