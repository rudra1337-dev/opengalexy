import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveGroup } from '../redux/slices/groupsSlice'
import { setActiveChat } from '../redux/slices/chatsSlice'
import MainLayout from '../components/Layout/MainLayout'
import ChatList from '../components/Chats/ChatList'
import ChatScreen from '../components/Chats/ChatScreen'
import GroupList from '../components/Groups/GroupList'
import GroupScreen from '../components/Groups/GroupScreen'
import NearbyScreen from '../components/NearbyShare/NearbyScreen'
import CallScreen from '../components/Calls/CallScreen'
import ProfileCard from '../components/Profile/ProfileCard'
import SettingsPanel from '../components/Profile/SettingsPanel'
import ProfilePage from './ProfilePage'

export default function HomePage() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { activeChat } = useSelector((state) => state.chats)
    const { activeGroup } = useSelector((state) => state.groups)

    // Default redirect to chats
    useEffect(() => {
        if (location.pathname === '/home' || location.pathname === '/home/') {
            navigate('/home/chats', { replace: true })
        }
    }, [location, navigate])

    const handleCall = (callType) => {
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
                        sidebar={<ChatList onSelectChat={handleSelectChat} />}
                        main={
                            <ChatScreen
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
                            <GroupList onSelectGroup={handleSelectGroup} />
                        }
                        main={<GroupScreen onBack={handleBackToGroups} />}
                    />
                }
            />

            <Route
                path="nearby"
                element={
                    <MainLayout
                        section="nearby"
                        sidebar={<NearbyScreen mode="devices" />}
                        main={<NearbyScreen mode="details" />}
                    />
                }
            />

            <Route
                path="calls"
                element={
                    <MainLayout
                        section="calls"
                        sidebar={<CallScreen mode="history" />}
                        main={<CallScreen mode="details" />}
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
