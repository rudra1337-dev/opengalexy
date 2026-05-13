import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setChatList, setActiveChat } from '../../redux/slices/chatsSlice'
import { setLoading } from '../../redux/slices/uiSlice'
import { chatService } from '../../services/chatService'
import ChatItem from './ChatItem'
import styles from '../../styles/Chats/ChatList.module.css'

export default function ChatList({ onSelectChat }) {
    const dispatch = useDispatch()
    const { chatList, activeChat } = useSelector((state) => state.chats)
    const { user } = useSelector((state) => state.auth)
    const { loading } = useSelector((state) => state.ui)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')

    useEffect(() => {
        const loadChats = async () => {
            dispatch(setLoading({ key: 'fetchingChats', value: true }))
            try {
                const response = await chatService.getUserRooms()
                dispatch(setChatList(response.data.rooms))
            } catch (error) {
                console.error('Error loading chats:', error)
            } finally {
                dispatch(setLoading({ key: 'fetchingChats', value: false }))
            }
        }

        loadChats()
    }, [dispatch])

    const filteredChats = chatList.filter((chat) => {
        const otherUser = chat.members?.find(
            (member) => member._id !== user?._id
        )
        const matchesSearch =
            otherUser?.username
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            otherUser?.displayName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false
        if (activeFilter === 'unread') return (chat.unreadCount || 0) > 0
        if (activeFilter === 'online') return Boolean(otherUser?.isOnline)
        return true
    })

    const handleSelectChat = (chat) => {
        dispatch(setActiveChat(chat))
        onSelectChat?.(chat)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className={styles.eyebrow}>Inbox</p>
                        <h2 className={styles.headerTitle}>Messages</h2>
                        <p className={styles.headerSubtitle}>
                            Keep up with friends, quick replies, and temporary
                            chats.
                        </p>
                    </div>
                    <div className={styles.headerBadge}>{chatList.length}</div>
                </div>

                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search people or usernames"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filters}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: 'Unread' },
                        { key: 'online', label: 'Online' }
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            className={`${styles.filterChip} ${activeFilter === filter.key ? styles.filterChipActive : ''}`}
                            onClick={() => setActiveFilter(filter.key)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.list}>
                {loading.fetchingChats ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={`chat-skeleton-${index}`}
                            className={styles.skeletonRow}
                        >
                            <div className={styles.skeletonAvatar}></div>
                            <div className={styles.skeletonContent}>
                                <div className={styles.skeletonLine}></div>
                                <div
                                    className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : filteredChats.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            {searchQuery ? '🔎' : '💬'}
                        </div>
                        <div className={styles.emptyText}>
                            {searchQuery
                                ? 'No conversations matched your search.'
                                : 'Your message universe is quiet right now. Start a new chat to light it up.'}
                        </div>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <ChatItem
                            key={chat._id}
                            chat={chat}
                            isActive={activeChat?._id === chat._id}
                            onClick={() => handleSelectChat(chat)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
