import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom'
import { setUser, setLoading } from './redux/slices/authSlice'
import { setSocket, setConnected } from './redux/slices/socketSlice'
import api from './services/api'
import { initSocket } from './services/socketService'

// Pages
import Landing from './pages/Landing'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import CallPage from './pages/CallPage'

function AuthLoadingScreen() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)'
            }}
        >
            Checking your session...
        </div>
    )
}

function LandingRoute({ children }) {
    const { isAuthenticated, usernameSet, isLoading } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (isAuthenticated) {
        return <Navigate to={usernameSet ? '/home' : '/onboarding'} replace />
    }

    return children
}

function OnboardingRoute({ children }) {
    const { isAuthenticated, usernameSet, isLoading } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (usernameSet) {
        return <Navigate to="/home" replace />
    }

    return children
}

function ProtectedRoute({ children }) {
    const { isAuthenticated, usernameSet, isLoading } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (!usernameSet) {
        return <Navigate to="/onboarding" replace />
    }

    return children
}

function App() {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    // Check if user is already logged in on app load
    useEffect(() => {
        const checkAuth = async () => {
            dispatch(setLoading(true))
            try {
                const response = await api.get('/auth/me')
                dispatch(setUser(response.data.user))
            } catch {
                console.log('Not authenticated')
                dispatch(setUser(null))
            } finally {
                dispatch(setLoading(false))
            }
        }

        checkAuth()
    }, [dispatch])

    // Initialize Socket.io when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const socket = initSocket(user._id)
            dispatch(setSocket(socket))

            socket.on('connect', () => {
                console.log('✅ Socket connected')
                dispatch(setConnected(true))
            })

            socket.on('disconnect', () => {
                console.log('❌ Socket disconnected')
                dispatch(setConnected(false))
            })

            return () => {
                socket.disconnect()
            }
        }
    }, [isAuthenticated, user, dispatch])

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <LandingRoute>
                            <Landing />
                        </LandingRoute>
                    }
                />
                <Route
                    path="/onboarding"
                    element={
                        <OnboardingRoute>
                            <OnboardingPage />
                        </OnboardingRoute>
                    }
                />

                <Route
                    path="/home/*"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/call/:roomId"
                    element={
                        <ProtectedRoute>
                            <CallPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Router>
    )
}

export default App
