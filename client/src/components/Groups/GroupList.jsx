import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMyGroups, setActiveGroup } from '../../redux/slices/groupsSlice'
import { groupService } from '../../services/groupService'
import GroupCard from './GroupCard'
import GroupCreatorModal from './GroupCreatorModal'
import DiscoverGroups from './DiscoverGroups'
import styles from '../../styles/Groups/GroupList.module.css'

export default function GroupList({ onSelectGroup }) {
    const dispatch = useDispatch()
    const { myGroups, activeGroup } = useSelector((state) => state.groups)
    const [activeTab, setActiveTab] = useState('mine') // 'mine' | 'discover'
    const [showCreator, setShowCreator] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Load my groups on mount
    useEffect(() => {
        const loadGroups = async () => {
            setIsLoading(true)
            try {
                const response = await groupService.getMyGroups()
                dispatch(setMyGroups(response.data.groups))
            } catch (error) {
                console.error('Error loading groups:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadGroups()
    }, [dispatch])

    const filteredGroups = myGroups.filter((group) =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelectGroup = (group) => {
        dispatch(setActiveGroup(group))
        onSelectGroup(group)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div>
                        <p className={styles.eyebrow}>Circles</p>
                        <h2 className={styles.headerTitle}>Groups</h2>
                        <p className={styles.headerSubtitle}>
                            Stay close to communities, drops, and public
                            discover spaces.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.createBtn}
                        onClick={() => setShowCreator(true)}
                        title="Create group"
                    >
                        ✦
                    </button>
                </div>

                {activeTab === 'mine' && (
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'mine' ? styles.active : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    My Groups
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'discover' ? styles.active : ''}`}
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
            </div>

            <div className={styles.list}>
                {activeTab === 'mine' ? (
                    isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={`group-skeleton-${index}`}
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
                    ) : filteredGroups.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>👥</div>
                            <div className={styles.emptyText}>
                                {searchQuery
                                    ? 'No groups matched your search.'
                                    : 'No groups yet. Create one or join one from discover.'}
                            </div>
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <GroupCard
                                key={group._id}
                                group={group}
                                isActive={activeGroup?._id === group._id}
                                onClick={() => handleSelectGroup(group)}
                            />
                        ))
                    )
                ) : (
                    <DiscoverGroups
                        onJoinGroup={(group) => {
                            dispatch(setMyGroups([...myGroups, group]))
                            setActiveTab('mine')
                        }}
                    />
                )}
            </div>

            {showCreator && (
                <GroupCreatorModal onClose={() => setShowCreator(false)} />
            )}
        </div>
    )
}
