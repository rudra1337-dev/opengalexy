import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    setActiveGroup,
    setMyGroups,
    setPublicGroups
} from '../redux/slices/groupsSlice'
import { setActiveChat, setChatList } from '../redux/slices/chatsSlice'
import MainLayout from '../components/Layout/MainLayout'
import ChatList from '../components/Chats/ChatList'
import ChatScreen from '../components/Chats/ChatScreen'
import GroupList from '../components/Groups/GroupList'
import GroupScreen from '../components/Groups/GroupScreen'
import NearbyScreen from '../components/NearbyShare/NearbyScreen'
import CallScreen from '../components/Calls/CallScreen'
import ProfilePage from './ProfilePage'
import { useNearby } from '../hooks/useNearby'
import useGuestNearby from '../hooks/useGuestNearby'
import {
    guestChats,
    guestGroups,
    guestPublicGroups
} from '../mocks/guestData'

function NearbyRoutePage({ isGuest = false }) {
    const nearby = useNearby()
    const guestNearby = useGuestNearby()
    const nearbyState = isGuest ? guestNearby : nearby

    return (
        <MainLayout
            section="nearby"
            sidebar={<NearbyScreen mode="sidebar" nearby={nearbyState} />}
            main={<NearbyScreen mode="detail" nearby={nearbyState} />}
        />
    )
}

export default function HomePage({
    basePath = '/home',
    isGuest = false
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { activeChat } = useSelector((state) => state.chats)
    const { activeGroup } = useSelector((state) => state.groups)

    // Default redirect to chats
    useEffect(() => {
        if (
            location.pathname === basePath ||
            location.pathname === `${basePath}/`
        ) {
            navigate(`${basePath}/chats`, { replace: true })
        }
    }, [basePath, location.pathname, navigate])

    useEffect(() => {
        if (!isGuest) return

        dispatch(setChatList(guestChats))
        dispatch(setActiveChat(null))
        dispatch(setMyGroups(guestGroups))
        dispatch(setPublicGroups(guestPublicGroups))
        dispatch(setActiveGroup(null))
    }, [dispatch, isGuest])

    const handleCall = (callType) => {
        if (isGuest) return
        if (!activeChat) return
        navigate(`/call/${activeChat._id}?type=${callType}`)
    }

    const handleSelectChat = (chat) => {
        dispatch(setActiveChat(chat))
    }

    const handleSelectGroup = (group) => {
        dispatch(setActiveGroup(group))
    }

    const handleBackToChats = () => {
        dispatch(setActiveChat(null))
    }

    const handleBackToGroups = () => {
        dispatch(setActiveGroup(null))
    }

    return (
        <Routes>
            <Route
                path="chats"
                element={
                    <MainLayout
                        section="chats"
                        detailOpen={Boolean(activeChat)}
                        sidebar={
                            <ChatList
                                isGuest={isGuest}
                                onSelectChat={handleSelectChat}
                            />
                        }
                        main={
                            <ChatScreen
                                isGuest={isGuest}
                                onCall={handleCall}
                                onBack={handleBackToChats}
                            />
                        }
                    />
                }
            />

            <Route
                path="groups"
                element={
                    <MainLayout
                        section="groups"
                        detailOpen={Boolean(activeGroup)}
                        sidebar={
                            <GroupList
                                isGuest={isGuest}
                                onSelectGroup={handleSelectGroup}
                            />
                        }
                        main={
                            <GroupScreen
                                isGuest={isGuest}
                                onBack={handleBackToGroups}
                            />
                        }
                    />
                }
            />

            <Route
                path="nearby"
                element={<NearbyRoutePage isGuest={isGuest} />}
            />

            <Route
                path="calls"
                element={
                    <MainLayout
                        section="calls"
                        sidebar={
                            <CallScreen isGuest={isGuest} mode="history" />
                        }
                        main={<CallScreen isGuest={isGuest} mode="details" />}
                    />
                }
            />

            <Route
                path="profile"
                element={
                    <MainLayout
                        sidebar={
                            <div
                                className="flex flex-col h-full"
                                style={{ backgroundColor: 'var(--bg-primary)' }}
                            >
                                <div
                                    className="p-4 border-b"
                                    style={{
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <h2
                                        className="text-lg font-bold"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Profile
                                    </h2>
                                </div>
                                <ProfilePage />
                            </div>
                        }
                        main={
                            <div
                                className="flex items-center justify-center h-full"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                <div className="text-center">
                                    <div className="text-5xl mb-3">👤</div>
                                    <div className="text-sm">
                                        Your profile & settings
                                    </div>
                                </div>
                            </div>
                        }
                    />
                }
            />
        </Routes>
    )
}
