import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    cache: {}
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        cacheMessages: (state, action) => {
            const { roomId, messages } = action.payload
            state.cache[roomId] = messages
        },
        addMessageToCache: (state, action) => {
            const { roomId, message } = action.payload
            if (!state.cache[roomId]) {
                state.cache[roomId] = []
            }
            state.cache[roomId].push(message)
        },
        removeFromCache: (state, action) => {
            const { roomId, messageId } = action.payload
            if (state.cache[roomId]) {
                state.cache[roomId] = state.cache[roomId].filter(
                    (m) => m._id !== messageId
                )
            }
        },
        clearCache: (state, action) => {
            state.cache[action.payload] = []
        }
    }
})

export const { cacheMessages, addMessageToCache, removeFromCache, clearCache } =
    messagesSlice.actions

export default messagesSlice.reducer
