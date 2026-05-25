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
            if (
                state.activeMessages.some(
                    (message) => message._id === action.payload._id
                )
            ) {
                return
            }

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
        replaceOptimisticMessage: (state, action) => {
            const { clientTempId, message } = action.payload
            const messageIndex = state.activeMessages.findIndex(
                (item) => item._id === clientTempId
            )

            if (messageIndex >= 0) {
                state.activeMessages[messageIndex] = message
                return
            }

            if (
                !state.activeMessages.some((item) => item._id === message._id)
            ) {
                state.activeMessages.push(message)
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
            if (message && !message.readBy?.includes(userId)) {
                if (!message.readBy) {
                    message.readBy = []
                }
                message.readBy.push(userId)
            }
        },
        upsertChat: (state, action) => {
            const incomingChat = action.payload
            const existingIndex = state.chatList.findIndex(
                (chat) => chat._id === incomingChat._id
            )

            if (existingIndex >= 0) {
                const existingChat = state.chatList[existingIndex]
                const mergedChat = {
                    ...existingChat,
                    ...incomingChat,
                    members: incomingChat.members || existingChat.members,
                    lastMessage:
                        incomingChat.lastMessage || existingChat.lastMessage
                }

                state.chatList.splice(existingIndex, 1)
                state.chatList.unshift(mergedChat)

                if (state.activeChat?._id === mergedChat._id) {
                    state.activeChat = mergedChat
                }
                return
            }

            state.chatList.unshift(incomingChat)

            if (state.activeChat?._id === incomingChat._id) {
                state.activeChat = incomingChat
            }
        },
        updateUserPresence: (state, action) => {
            const { userId, status, lastSeen } = action.payload

            const patchMember = (member) => {
                if (!member || member._id !== userId) return member

                return {
                    ...member,
                    isOnline: status === 'online',
                    lastSeen: lastSeen || member.lastSeen
                }
            }

            state.chatList = state.chatList.map((chat) => ({
                ...chat,
                members: chat.members?.map(patchMember)
            }))

            if (state.activeChat) {
                state.activeChat = {
                    ...state.activeChat,
                    members: state.activeChat.members?.map(patchMember)
                }
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
    replaceOptimisticMessage,
    removeMessage,
    updateMessageReadBy,
    upsertChat,
    updateUserPresence,
    setLoadingMessages,
    setError
} = chatsSlice.actions

export default chatsSlice.reducer
