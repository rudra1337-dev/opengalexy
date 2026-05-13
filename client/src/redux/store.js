import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chatsReducer from './slices/chatsSlice'
import messagesReducer from './slices/messagesSlice'
import groupsReducer from './slices/groupsSlice'
import uiReducer from './slices/uiSlice'
import socketReducer from './slices/socketSlice'
import callReducer from './slices/callSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chats: chatsReducer,
        messages: messagesReducer,
        groups: groupsReducer,
        ui: uiReducer,
        socket: socketReducer,
        call: callReducer
    }
})

export default store
