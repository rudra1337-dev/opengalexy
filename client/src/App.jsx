import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom'
import { clearAuth, setUser, setLoading } from './redux/slices/authSlice'
import { setSocket, setConnected } from './redux/slices/socketSlice'
import {
    upsertChat,
    updateUserPresence
} from './redux/slices/chatsSlice'
import { authService } from './services/authService'
import {
    initSocket,
    disconnectSocket
} from './services/socketService'

// Pages
import Landing from './pages/Landing'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import CallPage from './pages/CallPage'

let authBootstrapPromise = null

const getBootstrappedUser = async () => {
    if (!authBootstrapPromise) {
        authBootstrapPromise = authService
            .getMe()
            .then((response) => response.data.user)
            .catch((error) => {
                if (error.response?.status === 401) {
                    return null
                }
                throw error
            })
            .finally(() => {
                authBootstrapPromise = null
            })
    }

    return authBootstrapPromise
}

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
    const { isAuthenticated, usernameSet, isLoading, sessionMode } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (isAuthenticated) {
        return <Navigate to={usernameSet ? '/home' : '/onboarding'} replace />
    }

    if (sessionMode === 'guest') {
        return <Navigate to="/guest" replace />
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
    const { isAuthenticated, usernameSet, isLoading, sessionMode } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to={sessionMode === 'guest' ? '/guest' : '/'} replace />
    }

    if (!usernameSet) {
        return <Navigate to="/onboarding" replace />
    }

    return children
}

function GuestRoute({ children }) {
    const { isAuthenticated, sessionMode, isLoading, usernameSet } = useSelector(
        (state) => state.auth
    )

    if (isLoading) {
        return <AuthLoadingScreen />
    }

    if (isAuthenticated) {
        return <Navigate to={usernameSet ? '/home' : '/onboarding'} replace />
    }

    if (sessionMode !== 'guest') {
        return <Navigate to="/" replace />
    }

    return children
}

function App() {
    const dispatch = useDispatch()
    const { user, isAuthenticated, sessionMode } = useSelector(
        (state) => state.auth
    )
    const { socket } = useSelector((state) => state.socket)

    // Check if user is already logged in on app load
    useEffect(() => {
        let cancelled = false

        if (sessionMode === 'guest') {
            dispatch(setLoading(false))
            return () => {
                cancelled = true
            }
        }

        const checkAuth = async () => {
            dispatch(setLoading(true))
            try {
                const sessionUser = await getBootstrappedUser()
                if (!cancelled) {
                    dispatch(setUser(sessionUser))
                }
            } catch (error) {
                console.error('Error checking auth session:', error)
                if (!cancelled) {
                    dispatch(setUser(null))
                }
            } finally {
                if (!cancelled) {
                    dispatch(setLoading(false))
                }
            }
        }

        checkAuth()

        return () => {
            cancelled = true
        }
    }, [dispatch, sessionMode])

    useEffect(() => {
        const handleUnauthorized = () => {
            disconnectSocket()
            dispatch(clearAuth())
            dispatch(setConnected(false))
            dispatch(setLoading(false))
        }

        window.addEventListener('auth:unauthorized', handleUnauthorized)

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized)
        }
    }, [dispatch])

    // Initialize Socket.io when user is authenticated
    useEffect(() => {
        if (sessionMode === 'authenticated' && isAuthenticated && user) {
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
                disconnectSocket()
                dispatch(setConnected(false))
            }
        }
    }, [isAuthenticated, user, dispatch, sessionMode])

    useEffect(() => {
        if (!socket || sessionMode !== 'authenticated' || !isAuthenticated) {
            return undefined
        }

        const handleChatUpdated = (chat) => {
            if (chat.type !== 'direct') return
            dispatch(upsertChat(chat))
        }

        const handleUserStatus = (payload) => {
            dispatch(updateUserPresence(payload))
        }

        socket.on('chat-updated', handleChatUpdated)
        socket.on('user-status', handleUserStatus)

        return () => {
            socket.off('chat-updated', handleChatUpdated)
            socket.off('user-status', handleUserStatus)
        }
    }, [socket, dispatch, isAuthenticated, sessionMode])

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
                    path="/guest/*"
                    element={
                        <GuestRoute>
                            <HomePage basePath="/guest" isGuest />
                        </GuestRoute>
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
