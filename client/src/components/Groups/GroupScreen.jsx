import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    addGroupMessage,
    setActiveGroupMessages
} from '../../redux/slices/groupsSlice'
import { chatService } from '../../services/chatService'
import { getSocket } from '../../services/socketService'
import { formatDate } from '../../utils/formatters'
import GroupHeader from './GroupHeader'
import MessageBubble from '../Chats/MessageBubble'
import InputBar from '../Chats/InputBar'
import styles from '../../styles/Groups/GroupScreen.module.css'

export default function GroupScreen({ onSettings, onBack }) {
    const dispatch = useDispatch()
    const { activeGroup, activeGroupMessages } = useSelector(
        (state) => state.groups
    )
    const { user } = useSelector((state) => state.auth)
    const messagesEndRef = useRef(null)
    const [typingUser, setTypingUser] = useState('')
    const socket = getSocket()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeGroupMessages])

    useEffect(() => {
        if (!activeGroup?.room) return

        const loadMessages = async () => {
            try {
                const response = await chatService.getMessages(activeGroup.room)
                dispatch(setActiveGroupMessages(response.data.messages))
            } catch (error) {
                console.error('Error loading group messages:', error)
            }
        }

        loadMessages()
    }, [activeGroup, dispatch])

    useEffect(() => {
        if (!socket || !activeGroup?.room) return

        socket.emit('join-room', activeGroup.room)

        return () => {
            socket.emit('leave-room', activeGroup.room)
        }
    }, [socket, activeGroup])

    useEffect(() => {
        if (!socket || !activeGroup?.room) return

        socket.on('message-received', (message) => {
            if (message.roomId === activeGroup.room) {
                dispatch(addGroupMessage(message))
            }
        })

        socket.on('user-typing', ({ username }) => {
            setTypingUser(username)
        })

        socket.on('user-stop-typing', () => {
            setTypingUser('')
        })

        return () => {
            socket.off('message-received')
            socket.off('user-typing')
            socket.off('user-stop-typing')
        }
    }, [socket, activeGroup, dispatch])

    const handleSendMessage = (data) => {
        if (!activeGroup?.room || !socket) return

        // Optimistic update
        const tempMessage = {
            _id: 'temp-' + Date.now(),
            roomId: activeGroup.room,
            sender: user,
            content: data.content,
            isTemp: data.isTemp,
            type: data.type,
            readBy: [user._id],
            createdAt: new Date().toISOString()
        }

        dispatch(addGroupMessage(tempMessage))
        setTypingUser('')

        socket.emit('send-message', {
            roomId: activeGroup.room,
            content: data.content,
            isTemp: data.isTemp,
            duration: data.duration,
            type: data.type
        })
    }

    const handleTyping = (isTyping) => {
        if (!socket || !activeGroup?.room) return
        if (isTyping) {
            socket.emit('typing', {
                roomId: activeGroup.room,
                username: user.username
            })
        } else {
            socket.emit('stop-typing', { roomId: activeGroup.room })
        }
    }

    if (!activeGroup) {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeScreen}>
                    <div className={styles.welcomeOrb}>👥</div>
                    <h2>Group Constellations</h2>
                    <p>
                        Choose a group from the left to jump into discussions,
                        public rooms, and temporary communities.
                    </p>
                </div>
            </div>
        )
    }

    const messageFeed = []
    let lastDate = ''

    activeGroupMessages.forEach((message) => {
        const currentDate = formatDate(message.createdAt)
        if (currentDate !== lastDate) {
            messageFeed.push(
                <div
                    key={`group-separator-${message._id}`}
                    className={styles.dateSeparator}
                >
                    <span>{currentDate}</span>
                </div>
            )
            lastDate = currentDate
        }

        messageFeed.push(
            <div key={message._id}>
                {message.sender._id !== user._id && (
                    <div className={styles.senderName}>
                        @{message.sender.username}
                    </div>
                )}
                <MessageBubble
                    message={message}
                    isSent={message.sender._id === user._id}
                />
            </div>
        )
    })

    return (
        <div className={styles.container}>
            <GroupHeader
                group={activeGroup}
                onSettings={onSettings}
                onBack={onBack}
            />

            <div className={styles.messages}>
                {activeGroupMessages.length === 0 ? (
                    <div className={styles.messagesEmpty}>
                        <div className={styles.emptyEmoji}>👋</div>
                        <div>No messages yet. Be the first to say hello.</div>
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

            {user ? (
                <div className={styles.input}>
                    <InputBar
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                    />
                </div>
            ) : (
                <div className={styles.guestBanner}>
                    <span>You're browsing as guest.</span>
                    <a href="/" className={styles.guestBannerLink}>
                        Sign in to reply →
                    </a>
                </div>
            )}
        </div>
    )
}
