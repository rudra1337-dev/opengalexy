import { useTheme } from '../../context/useTheme'
import styles from '../../styles/Layout/ThemeToggle.module.css'

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    )
}
