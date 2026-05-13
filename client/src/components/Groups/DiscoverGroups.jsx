import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    setPublicGroups,
    addGroupToMyGroups
} from '../../redux/slices/groupsSlice'
import { groupService } from '../../services/groupService'
import styles from '../../styles/Groups/DiscoverGroups.module.css'

export default function DiscoverGroups({ onJoinGroup }) {
    const dispatch = useDispatch()
    const { publicGroups } = useSelector((state) => state.groups)
    const { myGroups } = useSelector((state) => state.groups)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const loadPublicGroups = async () => {
            setIsLoading(true)
            try {
                const response = await groupService.discoverGroups()
                dispatch(setPublicGroups(response.data.groups))
            } catch (error) {
                console.error('Error loading public groups:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadPublicGroups()
    }, [dispatch])

    const handleJoin = async (inviteCode) => {
        try {
            const response = await groupService.joinGroup(inviteCode)
            dispatch(addGroupToMyGroups(response.data.group))
            onJoinGroup(response.data.group)
        } catch (error) {
            console.error('Error joining group:', error)
        }
    }

    const isAlreadyMember = (groupId) => {
        return myGroups.some((g) => g._id === groupId)
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading public groups...</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>Discover Groups</h3>
                <p className={styles.headerSubtitle}>
                    Browse public groups — no login needed to read
                </p>
            </div>

            <div className={styles.list}>
                {publicGroups.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🌐</div>
                        <div className={styles.emptyText}>
                            No public groups yet
                        </div>
                    </div>
                ) : (
                    publicGroups.map((group) => (
                        <div key={group._id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {group.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        {group.name}
                                    </div>
                                    <div className={styles.description}>
                                        {group.description || 'No description'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.members}>
                                    👥 {group.members?.length || 0} members
                                </div>
                                <button
                                    className={`${styles.joinBtn} ${
                                        isAlreadyMember(group._id)
                                            ? styles.joined
                                            : ''
                                    }`}
                                    onClick={() =>
                                        !isAlreadyMember(group._id) &&
                                        handleJoin(group.inviteCode)
                                    }
                                    disabled={isAlreadyMember(group._id)}
                                >
                                    {isAlreadyMember(group._id)
                                        ? '✓ Joined'
                                        : 'Join Group'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
