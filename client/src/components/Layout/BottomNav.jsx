import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styles from '../../styles/Layout/BottomNav.module.css'

export default function BottomNav() {
    const { sessionMode } = useSelector((state) => state.auth)
    const basePath = sessionMode === 'guest' ? '/guest' : '/home'

    return (
        <nav className={styles.nav}>
            <div className={styles.items}>
                <NavLink
                    to={`${basePath}/chats`}
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>💬</span>
                    <span className={styles.itemLabel}>Chats</span>
                </NavLink>

                <NavLink
                    to={`${basePath}/groups`}
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>👥</span>
                    <span className={styles.itemLabel}>Groups</span>
                </NavLink>

                <NavLink
                    to={`${basePath}/nearby`}
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>📡</span>
                    <span className={styles.itemLabel}>Nearby</span>
                </NavLink>

                <NavLink
                    to={`${basePath}/calls`}
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>📞</span>
                    <span className={styles.itemLabel}>Calls</span>
                </NavLink>
            </div>
        </nav>
    )
}
