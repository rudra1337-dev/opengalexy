import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    setChatList,
    setActiveChat,
    upsertChat
} from '../../redux/slices/chatsSlice'
import { setLoading } from '../../redux/slices/uiSlice'
import { chatService } from '../../services/chatService'
import { userService } from '../../services/userService'
import ChatItem from './ChatItem'
import styles from '../../styles/Chats/ChatList.module.css'

export default function ChatList({ onSelectChat, isGuest = false }) {
    const dispatch = useDispatch()
    const { chatList, activeChat } = useSelector((state) => state.chats)
    const { user } = useSelector((state) => state.auth)
    const { loading } = useSelector((state) => state.ui)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchResults, setSearchResults] = useState([])
    const [isSearchingUsers, setIsSearchingUsers] = useState(false)

    useEffect(() => {
        if (isGuest) {
            dispatch(setLoading({ key: 'fetchingChats', value: false }))
            return
        }

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
    }, [dispatch, isGuest])

    useEffect(() => {
        if (isGuest) return undefined

        const trimmedQuery = searchQuery.trim()

        if (trimmedQuery.length < 2) {
            return undefined
        }

        const timeoutId = setTimeout(async () => {
            setIsSearchingUsers(true)

            try {
                const response = await userService.searchUsers(trimmedQuery)
                setSearchResults(
                    response.data.users.filter(
                        (candidate) => candidate._id !== user?._id
                    )
                )
            } catch (error) {
                console.error('Error searching users:', error)
                setSearchResults([])
            } finally {
                setIsSearchingUsers(false)
            }
        }, 220)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, isGuest, user?._id])

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

    const existingChatUsernames = new Set(
        chatList
            .map((chat) =>
                chat.members?.find((member) => member._id !== user?._id)?.username
            )
            .filter(Boolean)
    )

    const discoverableUsers = searchResults.filter(
        (candidate) => !existingChatUsernames.has(candidate.username)
    )

    const handleSelectChat = (chat) => {
        dispatch(setActiveChat(chat))
        onSelectChat?.(chat)
    }

    const handleStartChat = async (person) => {
        try {
            const response = await chatService.getOrCreateDirectRoom(
                person.username
            )
            const room = response.data.room

            dispatch(upsertChat(room))
            dispatch(setActiveChat(room))
            onSelectChat?.(room)
            setSearchQuery('')
            setSearchResults([])
        } catch (error) {
            console.error('Error starting chat:', error)
        }
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
                {!isGuest && searchQuery.trim().length >= 2 && (
                    <div className={styles.discoveryBlock}>
                        <div className={styles.discoveryHeader}>
                            <span>People</span>
                            {isSearchingUsers ? (
                                <span className={styles.discoveryMeta}>
                                    Searching...
                                </span>
                            ) : (
                                <span className={styles.discoveryMeta}>
                                    {discoverableUsers.length} found
                                </span>
                            )}
                        </div>

                        {discoverableUsers.map((person) => (
                            <button
                                key={person._id}
                                type="button"
                                className={styles.discoveryCard}
                                onClick={() => handleStartChat(person)}
                            >
                                <div className={styles.discoveryAvatar}>
                                    {person.displayName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        person.username?.charAt(0)?.toUpperCase() ||
                                        '?'}
                                </div>
                                <div className={styles.discoveryInfo}>
                                    <strong>
                                        {person.displayName || `@${person.username}`}
                                    </strong>
                                    <span>@{person.username}</span>
                                </div>
                                <span className={styles.discoveryAction}>
                                    Start chat
                                </span>
                            </button>
                        ))}
                    </div>
                )}

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
