import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    myGroups: [],
    publicGroups: [],
    activeGroup: null,
    activeGroupMessages: [],
    isLoading: false,
    error: null
}

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setMyGroups: (state, action) => {
            state.myGroups = action.payload
        },
        setPublicGroups: (state, action) => {
            state.publicGroups = action.payload
        },
        setActiveGroup: (state, action) => {
            state.activeGroup = action.payload
            state.activeGroupMessages = []
        },
        setActiveGroupMessages: (state, action) => {
            state.activeGroupMessages = action.payload
        },
        addGroupMessage: (state, action) => {
            state.activeGroupMessages.push(action.payload)
        },
        removeGroupMessage: (state, action) => {
            state.activeGroupMessages = state.activeGroupMessages.filter(
                (m) => m._id !== action.payload
            )
        },
        addGroupToMyGroups: (state, action) => {
            state.myGroups.push(action.payload)
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})

export const {
    setMyGroups,
    setPublicGroups,
    setActiveGroup,
    setActiveGroupMessages,
    addGroupMessage,
    removeGroupMessage,
    addGroupToMyGroups,
    setLoading,
    setError
} = groupsSlice.actions

export default groupsSlice.reducer
