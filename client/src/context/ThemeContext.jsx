import { useEffect, useState, useContext } from 'react'
import { ThemeContext } from './ThemeStore'

const THEME_STORAGE_KEY = 'theme'

const getInitialTheme = () => {
    if (typeof window === 'undefined') {
        return false
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false

    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute(
            'data-theme',
            isDark ? 'dark' : 'light'
        )

        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'

        document.documentElement.classList.add('theme-ready')

        localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => {
        setIsDark((prev) => !prev)
    }

    return (
        <ThemeContext.Provider
            value={{
                isDark,
                theme: isDark ? 'dark' : 'light',
                setTheme: (theme) => setIsDark(theme === 'dark'),
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }

    return context
}
