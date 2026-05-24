import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    usernameSet: false,
    sessionMode: 'anonymous'
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
            state.usernameSet = action.payload?.usernameSet || false
            state.sessionMode = action.payload ? 'authenticated' : 'anonymous'
        },
        updateUser: (state, action) => {
            if (!state.user) return
            state.user = { ...state.user, ...action.payload }
            state.usernameSet = state.user?.usernameSet || false
        },
        enterGuestMode: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = false
            state.usernameSet = false
            state.sessionMode = 'guest'
            state.error = null
            state.isLoading = false
        },
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.usernameSet = false
            state.sessionMode = 'anonymous'
            state.error = null
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        }
    }
})

export const {
    setUser,
    updateUser,
    enterGuestMode,
    clearAuth,
    setLoading,
    setError,
    clearError
} = authSlice.actions
export default authSlice.reducer
