import { NavLink } from 'react-router-dom'
import styles from '../../styles/Layout/BottomNav.module.css'

export default function BottomNav() {
    return (
        <nav className={styles.nav}>
            <div className={styles.items}>
                <NavLink
                    to="/home/chats"
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>💬</span>
                    <span className={styles.itemLabel}>Chats</span>
                </NavLink>

                <NavLink
                    to="/home/groups"
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>👥</span>
                    <span className={styles.itemLabel}>Groups</span>
                </NavLink>

                <NavLink
                    to="/home/nearby"
                    className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}`
                    }
                >
                    <span className={styles.itemIcon}>📡</span>
                    <span className={styles.itemLabel}>Nearby</span>
                </NavLink>

                <NavLink
                    to="/home/calls"
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
