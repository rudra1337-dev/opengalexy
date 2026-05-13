import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    chatList: [],
    activeChat: null,
    activeMessages: [],
    isLoadingMessages: false,
    error: null,
    unreadCounts: {}
}

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setChatList: (state, action) => {
            state.chatList = action.payload
        },
        setActiveChat: (state, action) => {
            state.activeChat = action.payload
            state.activeMessages = []
        },
        setActiveMessages: (state, action) => {
            state.activeMessages = action.payload
        },
        addMessage: (state, action) => {
            state.activeMessages.push(action.payload)

            // Update lastMessage in chatList
            if (state.activeChat) {
                const chatIndex = state.chatList.findIndex(
                    (c) => c._id === state.activeChat._id
                )
                if (chatIndex >= 0) {
                    state.chatList[chatIndex].lastMessage = {
                        content: action.payload.content,
                        sender: action.payload.sender,
                        sentAt: action.payload.createdAt
                    }
                }
            }
        },
        removeMessage: (state, action) => {
            state.activeMessages = state.activeMessages.filter(
                (m) => m._id !== action.payload
            )
        },
        updateMessageReadBy: (state, action) => {
            const { messageId, userId } = action.payload
            const message = state.activeMessages.find(
                (m) => m._id === messageId
            )
            if (message && !message.readBy.includes(userId)) {
                message.readBy.push(userId)
            }
        },
        setLoadingMessages: (state, action) => {
            state.isLoadingMessages = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})

export const {
    setChatList,
    setActiveChat,
    setActiveMessages,
    addMessage,
    removeMessage,
    updateMessageReadBy,
    setLoadingMessages,
    setError
} = chatsSlice.actions

export default chatsSlice.reducer
