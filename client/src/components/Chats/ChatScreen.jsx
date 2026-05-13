import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    addMessage,
    removeMessage,
    setActiveMessages,
    setLoadingMessages,
    updateMessageReadBy
} from '../../redux/slices/chatsSlice'
import { chatService } from '../../services/chatService'
import { getSocket } from '../../services/socketService'
import { formatDate } from '../../utils/formatters'
import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'
import styles from '../../styles/Chats/ChatScreen.module.css'

export default function ChatScreen({ onCall, onBack }) {
    const dispatch = useDispatch()
    const { activeChat, activeMessages, isLoadingMessages } = useSelector(
        (state) => state.chats
    )
    const { user } = useSelector((state) => state.auth)
    const messagesEndRef = useRef(null)
    const [typingUser, setTypingUser] = useState('')
    const socket = getSocket()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeMessages])

    useEffect(() => {
        if (!activeChat) return

        const loadMessages = async () => {
            dispatch(setLoadingMessages(true))
            try {
                const response = await chatService.getMessages(activeChat._id)
                dispatch(setActiveMessages(response.data.messages))
            } catch (error) {
                console.error('Error loading messages:', error)
            } finally {
                dispatch(setLoadingMessages(false))
            }
        }

        loadMessages()
    }, [activeChat, dispatch])

    useEffect(() => {
        if (!socket || !activeChat?._id) return

        socket.emit('join-room', activeChat._id)

        return () => {
            socket.emit('leave-room', activeChat._id)
        }
    }, [socket, activeChat])

    useEffect(() => {
        if (!socket || !activeChat) return

        socket.on('message-received', (message) => {
            if (message.roomId === activeChat._id) {
                dispatch(addMessage(message))
            }
        })

        socket.on('message-burned', ({ messageId }) => {
            dispatch(removeMessage(messageId))
        })

        socket.on('message-seen', ({ messageId, userId }) => {
            dispatch(updateMessageReadBy({ messageId, userId }))
        })

        socket.on('user-typing', ({ username }) => {
            setTypingUser(username)
        })

        socket.on('user-stop-typing', () => {
            setTypingUser('')
        })

        return () => {
            socket.off('message-received')
            socket.off('message-burned')
            socket.off('message-seen')
            socket.off('user-typing')
            socket.off('user-stop-typing')
        }
    }, [socket, activeChat, dispatch])

    useEffect(() => {
        if (!socket || !activeChat || !user?._id) return

        activeMessages
            .filter(
                (message) =>
                    message.sender?._id !== user._id &&
                    !message.readBy?.includes(user._id)
            )
            .forEach((message) => {
                socket.emit('message-read', {
                    messageId: message._id,
                    roomId: activeChat._id
                })
            })
    }, [socket, activeChat, activeMessages, user])

    const handleSendMessage = async (data) => {
        if (!activeChat) return

        try {
            const tempMessage = {
                _id: 'temp-' + Date.now(),
                roomId: activeChat._id,
                sender: user,
                content: data.content,
                isTemp: data.isTemp,
                expiresAt: data.expiresAt,
                type: data.type,
                readBy: [user._id],
                createdAt: new Date().toISOString()
            }

            dispatch(addMessage(tempMessage))
            setTypingUser('')

            socket.emit('send-message', {
                roomId: activeChat._id,
                content: data.content,
                isTemp: data.isTemp,
                duration: data.duration,
                type: data.type
            })
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleTyping = (isTyping) => {
        if (socket && activeChat) {
            if (isTyping) {
                socket.emit('typing', {
                    roomId: activeChat._id,
                    username: user.username
                })
            } else {
                socket.emit('stop-typing', { roomId: activeChat._id })
            }
        }
    }

    if (!activeChat) {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeScreen}>
                    <div className={styles.welcomeOrb}>🌌</div>
                    <h2>OpenGalexy Messaging</h2>
                    <p>
                        Pick a conversation from the left and keep chatting
                        across temporary drops, quick replies, and calls.
                    </p>
                </div>
            </div>
        )
    }

    const messageFeed = []
    let lastDate = ''

    activeMessages.forEach((message) => {
        const currentDate = formatDate(message.createdAt)
        if (currentDate !== lastDate) {
            messageFeed.push(
                <div
                    key={`separator-${message._id}`}
                    className={styles.dateSeparator}
                >
                    <span>{currentDate}</span>
                </div>
            )
            lastDate = currentDate
        }

        messageFeed.push(
            <MessageBubble
                key={message._id}
                message={message}
                isSent={message.sender._id === user._id}
            />
        )
    })

    return (
        <div className={styles.container}>
            <ChatHeader chat={activeChat} onCall={onCall} onBack={onBack} />

            <div className={styles.messages}>
                {isLoadingMessages ? (
                    <div className={styles.loadingStack}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={`message-skeleton-${index}`}
                                className={`${styles.messageSkeleton} ${index % 2 === 0 ? styles.messageSkeletonSent : ''}`}
                            ></div>
                        ))}
                    </div>
                ) : activeMessages.length === 0 ? (
                    <div className={styles.messagesEmpty}>
                        <span className={styles.emptyEmoji}>👋</span>
                        <span>
                            No messages yet. Say hello and start the
                            conversation.
                        </span>
                    </div>
                ) : (
                    messageFeed
                )}

                {typingUser && (
                    <div className={styles.typingRow}>
                        <div className={styles.typingBubble}>
                            <span>{typingUser} is typing</span>
                            <div className={styles.typingDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <InputBar
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isLoading={isLoadingMessages}
            />
        </div>
    )
}
