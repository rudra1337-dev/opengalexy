import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../../redux/slices/authSlice'
import { authService } from '../../services/authService'
import ThemeToggle from './ThemeToggle'
import styles from '../../styles/Layout/Navbar.module.css'

const sectionLabels = {
    chats: 'Messages',
    groups: 'Groups',
    nearby: 'Nearby Share',
    calls: 'Calls',
    profile: 'Settings'
}

export default function Navbar({ section = 'chats' }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await authService.logout()
            dispatch(clearAuth())
            navigate('/')
            setMenuOpen(false)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <div className={styles.logo}>🌌</div>
                <div className={styles.heading}>
                    <div className={styles.title}>OpenGalexy</div>
                    <div className={styles.subtitle}>
                        {sectionLabels[section] || 'Workspace'}
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <ThemeToggle />

                <button
                    className={styles.userAvatar}
                    title={user?.displayName}
                    onClick={() => navigate('/home/profile')}
                >
                    {user?.displayName?.charAt(0).toUpperCase()}
                </button>

                <div className={styles.menuWrap} ref={menuRef}>
                    <button
                        className={styles.button}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        title="Open menu"
                    >
                        ⋮
                    </button>

                    {menuOpen && (
                        <div className={styles.menu}>
                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    navigate('/home/profile')
                                    setMenuOpen(false)
                                }}
                            >
                                <span>⚙️</span>
                                <span>Settings</span>
                            </button>
                            <button
                                className={styles.menuItem}
                                onClick={() => {
                                    navigate('/home/calls')
                                    setMenuOpen(false)
                                }}
                            >
                                <span>📞</span>
                                <span>Calls</span>
                            </button>
                            <button
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                onClick={handleLogout}
                            >
                                <span>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
