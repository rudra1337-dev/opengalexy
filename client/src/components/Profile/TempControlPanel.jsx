import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../redux/slices/authSlice'
import api from '../../services/api'
import styles from '../../styles/Profile/TempControlPanel.module.css'

export default function TempControlPanel() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = async (field, value) => {
        setIsUpdating(true)
        try {
            const response = await api.patch('/users/settings', {
                [field]: value
            })
            dispatch(setUser(response.data.user))
        } catch (error) {
            console.error('Error updating settings:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const controls = [
        {
            field: 'burnAfterRead',
            label: '🔥 Burn After Read',
            desc: 'Messages vanish the moment recipient reads them',
            value: user?.burnAfterRead,
            warn: true
        },
        {
            field: 'defaultMessageMode',
            label: '⏱ Default Temp Messages',
            desc: 'All new messages are temporary by default',
            value: user?.defaultMessageMode === 'temp',
            warn: true,
            onToggle: (val) =>
                handleToggle('defaultMessageMode', val ? 'temp' : 'permanent')
        },
        {
            field: 'isTemp',
            label: '👤 Temporary Account',
            desc: 'Your account will auto-delete after set duration',
            value: user?.isTemp,
            warn: true
        }
    ]

    return (
        <div className="flex flex-col gap-2">
            <h3
                className="text-xs font-semibold uppercase tracking-wider px-1 mb-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Temp Controls
            </h3>

            <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-color)' }}
            >
                {controls.map((control, index) => (
                    <div
                        key={control.field}
                        className="flex items-center justify-between px-4 py-3"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderBottom:
                                index < controls.length - 1
                                    ? '1px solid var(--border-color)'
                                    : 'none'
                        }}
                    >
                        <div className="flex-1 min-w-0 mr-4">
                            <div
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {control.label}
                            </div>
                            <div
                                className="text-xs mt-0.5"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                {control.desc}
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={isUpdating}
                            className={`${styles.toggle} ${
                                control.value
                                    ? control.warn
                                        ? styles.warn
                                        : styles.on
                                    : ''
                            }`}
                            onClick={() => {
                                if (control.onToggle) {
                                    control.onToggle(!control.value)
                                } else {
                                    handleToggle(control.field, !control.value)
                                }
                            }}
                        >
                            <div className={styles.toggleSlider}></div>
                        </button>
                    </div>
                ))}
            </div>

            {/* Danger Zone */}
            <div className="mt-4">
                <h3
                    className="text-xs font-semibold uppercase tracking-wider px-1 mb-2"
                    style={{ color: 'var(--error-color)' }}
                >
                    Danger Zone
                </h3>
                <button
                    className={`${styles.dangerBtn} w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer`}
                    onClick={() => console.log('Delete account')}
                >
                    🗑️ Delete My Account
                </button>
            </div>
        </div>
    )
}
