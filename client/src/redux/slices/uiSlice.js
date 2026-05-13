import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    modals: {
        usernamePickerOpen: false,
        createGroupOpen: false,
        groupSettingsOpen: false,
        userProfileOpen: false,
        userSearchOpen: false
    },
    loading: {
        fetchingChats: false,
        sendingMessage: false,
        creatingGroup: false,
        joiningGroup: false
    },
    notifications: []
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openModal: (state, action) => {
            state.modals[action.payload] = true
        },
        closeModal: (state, action) => {
            state.modals[action.payload] = false
        },
        setLoading: (state, action) => {
            const { key, value } = action.payload
            state.loading[key] = value
        },
        addNotification: (state, action) => {
            const notification = {
                id: Date.now(),
                ...action.payload
            }
            state.notifications.push(notification)
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            )
        }
    }
})

export const {
    openModal,
    closeModal,
    setLoading,
    addNotification,
    removeNotification
} = uiSlice.actions

export default uiSlice.reducer
