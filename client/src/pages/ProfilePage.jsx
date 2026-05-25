import { useSelector } from 'react-redux'
import ProfileCard from '../components/Profile/ProfileCard'
import TempControlPanel from '../components/Profile/TempControlPanel'
import PrivacySettings from '../components/Profile/PrivacySettings'
import SettingsPanel from '../components/Profile/SettingsPanel'
import styles from '../styles/Profile/ProfilePage.module.css'

export default function ProfilePage() {
    const { user, sessionMode } = useSelector((state) => state.auth)

    return (
        <div className={styles.page}>
            <div className={styles.canvas}>
                <section className={styles.hero}>
                    <p className={styles.eyebrow}>Identity & Controls</p>
                    <h1 className={styles.heroTitle}>
                        Your OpenGalexy profile, tuned for private conversations
                    </h1>
                    <p className={styles.heroText}>
                        Manage how people recognize you, how temporary messaging
                        behaves by default, and which account protections stay
                        visible as you move between chats, groups, and nearby
                        sharing.
                    </p>

                    <div className={styles.heroTags}>
                        <span className={styles.tag}>
                            <span>👤</span>
                            <span>{user?.displayName || 'Explorer'}</span>
                        </span>
                        <span className={styles.tag}>
                            <span>🪪</span>
                            <span>
                                {user?.usernameSet
                                    ? 'Username verified'
                                    : 'Username setup pending'}
                            </span>
                        </span>
                        <span className={styles.tag}>
                            <span>🛰️</span>
                            <span>
                                {sessionMode === 'guest'
                                    ? 'Guest session'
                                    : 'Authenticated session'}
                            </span>
                        </span>
                    </div>
                </section>

                <div className={styles.contentGrid}>
                    <div className={styles.column}>
                        <div className={styles.panelShell}>
                            <ProfileCard />
                        </div>
                        <div className={styles.panelShell}>
                            <TempControlPanel />
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.panelShell}>
                            <PrivacySettings />
                        </div>
                        <div className={styles.panelShell}>
                            <SettingsPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
