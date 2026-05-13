import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    usernameSet: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
            state.usernameSet = action.payload?.usernameSet || false
        },
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.usernameSet = false
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

export const { setUser, clearAuth, setLoading, setError, clearError } =
    authSlice.actions
export default authSlice.reducer
