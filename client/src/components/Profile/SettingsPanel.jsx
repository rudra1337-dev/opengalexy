import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../../redux/slices/authSlice'
import { authService } from '../../services/authService'
import { useTheme } from '../../context/ThemeContext'
import styles from '../../styles/Profile/SettingsPanel.module.css'

export default function SettingsPanel() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { isDark, toggleTheme } = useTheme()

    const handleLogout = async () => {
        try {
            await authService.logout()
            dispatch(clearAuth())
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const settingItems = [
        {
            icon: '🎨',
            label: 'Theme',
            value: isDark ? 'Dark' : 'Light',
            iconBg: 'rgba(99, 102, 241, 0.1)',
            onClick: toggleTheme
        },
        {
            icon: '📧',
            label: 'Email',
            value: user?.email,
            iconBg: 'rgba(59, 130, 246, 0.1)',
            onClick: null
        },
        {
            icon: '🔔',
            label: 'Notifications',
            value: 'Coming soon',
            iconBg: 'rgba(245, 158, 11, 0.1)',
            onClick: null
        },
        {
            icon: '🔒',
            label: 'Security',
            value: 'Google Auth',
            iconBg: 'rgba(16, 185, 129, 0.1)',
            onClick: null
        },
        {
            icon: '❓',
            label: 'Help & Support',
            value: '',
            iconBg: 'rgba(107, 114, 128, 0.1)',
            onClick: null
        }
    ]

    return (
        <div className="flex flex-col gap-2">
            <h3
                className="text-xs font-semibold uppercase tracking-wider px-1 mb-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Settings
            </h3>

            {/* Settings List */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-color)' }}
            >
                {settingItems.map((item, index) => (
                    <div
                        key={item.label}
                        className={`flex items-center gap-3 px-4 py-3 ${item.onClick ? 'cursor-pointer' : ''}`}
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderBottom:
                                index < settingItems.length - 1
                                    ? '1px solid var(--border-color)'
                                    : 'none'
                        }}
                        onClick={item.onClick}
                    >
                        <div
                            className={`${styles.settingIcon}`}
                            style={{ backgroundColor: item.iconBg }}
                        >
                            {item.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {item.label}
                            </div>
                            {item.value && (
                                <div
                                    className="text-xs mt-0.5 truncate"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {item.value}
                                </div>
                            )}
                        </div>

                        {item.onClick && (
                            <span className={styles.arrowIcon}>›</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Logout */}
            <button
                className={`${styles.logoutBtn} w-full py-3 rounded-xl text-sm font-semibold cursor-pointer mt-2`}
                onClick={handleLogout}
            >
                🚪 Sign Out
            </button>

            {/* Version */}
            <div className="text-center mt-4">
                <span className={styles.versionText}>
                    OpenGalexy v1.0.0 — Built with ❤️
                </span>
            </div>
        </div>
    )
}
