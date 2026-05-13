import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import styles from '../../styles/Layout/MainLayout.module.css'

const navigationItems = [
    { to: '/home/chats', icon: '💬', label: 'Chats' },
    { to: '/home/groups', icon: '👥', label: 'Groups' },
    { to: '/home/nearby', icon: '📡', label: 'Nearby' },
    { to: '/home/calls', icon: '📞', label: 'Calls' }
]

export default function MainLayout({
    section,
    sidebar,
    main,
    detailOpen = false
}) {
    const { user } = useSelector((state) => state.auth)

    return (
        <div className={styles.shell}>
            <div
                className={`${styles.mobileNavbar} ${detailOpen ? styles.mobileChromeHidden : ''}`}
            >
                <Navbar section={section} />
            </div>

            <div className={styles.appFrame}>
                <aside className={styles.rail}>
                    <div className={styles.railTop}>
                        <div className={styles.brandMark}>🌌</div>
                        <div className={styles.brandText}>
                            <span>Open</span>
                            <span>Galexy</span>
                        </div>
                    </div>

                    <nav className={styles.railNav}>
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${styles.railLink} ${isActive ? styles.railLinkActive : ''}`
                                }
                                title={item.label}
                            >
                                <span className={styles.railIcon}>
                                    {item.icon}
                                </span>
                                <span className={styles.railLabel}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className={styles.railFooter}>
                        <NavLink
                            to="/home/profile"
                            className={styles.profileDock}
                        >
                            <div className={styles.profileAvatar}>
                                {user?.displayName?.charAt(0)?.toUpperCase() ||
                                    'O'}
                            </div>
                            <div className={styles.profileMeta}>
                                <strong>
                                    {user?.displayName || 'Explorer'}
                                </strong>
                                <span>@{user?.username || 'open_galexy'}</span>
                            </div>
                        </NavLink>
                    </div>
                </aside>

                <section
                    className={`${styles.sidebarPanel} ${detailOpen ? styles.sidebarHiddenMobile : ''}`}
                >
                    {sidebar}
                </section>

                <section
                    className={`${styles.detailPanel} ${detailOpen ? styles.detailVisible : ''}`}
                >
                    {main}
                </section>
            </div>

            <div
                className={`${styles.mobileFooter} ${detailOpen ? styles.mobileChromeHidden : ''}`}
            >
                <BottomNav />
            </div>
        </div>
    )
}
