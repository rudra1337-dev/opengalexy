import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addGroupToMyGroups } from '../../redux/slices/groupsSlice'
import { groupService } from '../../services/groupService'
import styles from '../../styles/Groups/GroupCreatorModal.module.css'

export default function GroupCreatorModal({ onClose }) {
    const dispatch = useDispatch()
    const [form, setForm] = useState({
        name: '',
        description: '',
        isPublic: false,
        isTemp: false,
        duration: '7d'
    })
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.name.trim()) {
            setError('Group name is required')
            return
        }

        if (form.name.trim().length < 3) {
            setError('Group name must be at least 3 characters')
            return
        }

        setIsCreating(true)
        try {
            const response = await groupService.createGroup({
                name: form.name.trim(),
                description: form.description.trim(),
                isPublic: form.isPublic,
                isTemp: form.isTemp,
                duration: form.isTemp ? form.duration : null
            })

            dispatch(addGroupToMyGroups(response.data.group))
            onClose()
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create group')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div
            className={styles.overlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Create Group</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Group Name */}
                    <div className={styles.field}>
                        <label className={styles.label}>Group Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                handleChange('name', e.target.value)
                            }
                            placeholder="e.g. Dev Talk India"
                            className={styles.input}
                            maxLength={50}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                handleChange('description', e.target.value)
                            }
                            placeholder="What's this group about?"
                            className={styles.textarea}
                            maxLength={200}
                        />
                    </div>

                    {/* Public Toggle */}
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <span className={styles.toggleLabel}>
                                🌐 Make Public
                            </span>
                            <span className={styles.toggleDesc}>
                                Anyone can find and read messages without login
                            </span>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${form.isPublic ? styles.on : ''}`}
                            onClick={() =>
                                handleChange('isPublic', !form.isPublic)
                            }
                        >
                            <div className={styles.toggleSlider}></div>
                        </button>
                    </div>

                    {/* Temp Toggle */}
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <span className={styles.toggleLabel}>
                                ⏱ Temporary Group
                            </span>
                            <span className={styles.toggleDesc}>
                                Group auto-deletes after selected duration
                            </span>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${form.isTemp ? styles.tempOn : ''}`}
                            onClick={() => handleChange('isTemp', !form.isTemp)}
                        >
                            <div className={styles.toggleSlider}></div>
                        </button>
                    </div>

                    {/* Duration Selector */}
                    {form.isTemp && (
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Group Duration
                            </label>
                            <select
                                value={form.duration}
                                onChange={(e) =>
                                    handleChange('duration', e.target.value)
                                }
                                className={styles.durationSelect}
                            >
                                <option value="1h">1 Hour</option>
                                <option value="24h">1 Day</option>
                                <option value="7d">7 Days</option>
                                <option value="30d">30 Days</option>
                            </select>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--error-color)',
                                fontSize: '13px'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.createBtn}
                            disabled={!form.name.trim() || isCreating}
                        >
                            {isCreating ? 'Creating...' : '🌌 Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
