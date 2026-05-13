import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUser, setLoading, setError } from '../../redux/slices/authSlice'
import { authService } from '../../services/authService'
import { validateUsername } from '../../utils/validators'
import styles from '../../styles/Auth/UsernamePickerModal.module.css'

export default function UsernamePickerModal() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [availability, setAvailability] = useState(null) // null, 'checking', 'available', 'taken', 'invalid'
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debounceTimer = useRef(null)

    // Requirements checker
    const requirements = {
        length: username.length >= 3 && username.length <= 20,
        alphanumeric: /^[a-zA-Z0-9_]*$/.test(username),
        notEmpty: username.length > 0
    }

    const isValid =
        requirements.length &&
        requirements.alphanumeric &&
        requirements.notEmpty
    const isAllRequirementsMet =
        requirements.length && requirements.alphanumeric

    // Debounced username check
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        if (!username) {
            setAvailability(null)
            return
        }

        const validation = validateUsername(username)
        if (!validation.valid) {
            setAvailability('invalid')
            return
        }

        setAvailability('checking')

        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await authService.checkUsername(username)
                if (response.data.available) {
                    setAvailability('available')
                } else {
                    setAvailability('taken')
                }
            } catch (error) {
                console.error('Error checking username:', error)
                setAvailability(null)
            }
        }, 500) // Wait 500ms after user stops typing

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [username])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isValid || availability !== 'available') {
            dispatch(setError('Please choose a valid available username'))
            return
        }

        setIsSubmitting(true)
        dispatch(setLoading(true))

        try {
            const response = await authService.setUsername(username)
            dispatch(setUser(response.data.user))
            navigate('/home')
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || 'Failed to set username'
            dispatch(setError(errorMsg))
        } finally {
            setIsSubmitting(false)
            dispatch(setLoading(false))
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value.toLowerCase()
        // Allow only alphanumeric and underscore
        const filtered = value.replace(/[^a-z0-9_]/g, '')
        setUsername(filtered)
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.icon}>👤</span>
                    <h2 className={styles.title}>Pick Your @Username</h2>
                    <p className={styles.subtitle}>
                        Choose a unique handle to get started. You can't change
                        it later.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Username Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>

                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={handleInputChange}
                                placeholder="rudra_dev"
                                className={styles.input}
                                autoFocus
                                maxLength={20}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Status */}
                        <div className={styles.inputStatus}>
                            {availability === 'checking' && (
                                <>
                                    <div className={styles.statusSpinner}></div>
                                    <span>Checking availability...</span>
                                </>
                            )}
                            {availability === 'available' && (
                                <span className={styles.statusAvailable}>
                                    Available!
                                </span>
                            )}
                            {availability === 'taken' && (
                                <span className={styles.statusTaken}>
                                    Already taken
                                </span>
                            )}
                            {availability === 'invalid' && (
                                <span className={styles.statusInvalid}>
                                    Invalid username
                                </span>
                            )}
                        </div>

                        <p className={styles.hint}>
                            3-20 characters: letters, numbers, underscore
                        </p>
                    </div>

                    {/* Requirements */}
                    <div className={styles.requirements}>
                        <div className={styles.requirement}>
                            <div
                                className={`${styles.requirementCheck} ${
                                    requirements.length
                                        ? styles.requirementMet
                                        : styles.requirementUnmet
                                }`}
                            >
                                {requirements.length ? '✓' : '○'}
                            </div>
                            <span>3-20 characters</span>
                        </div>

                        <div className={styles.requirement}>
                            <div
                                className={`${styles.requirementCheck} ${
                                    requirements.alphanumeric
                                        ? styles.requirementMet
                                        : styles.requirementUnmet
                                }`}
                            >
                                {requirements.alphanumeric ? '✓' : '○'}
                            </div>
                            <span>Letters, numbers, underscore only</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={styles.buttonPrimary}
                        disabled={
                            !isValid ||
                            availability !== 'available' ||
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? 'Creating Account...'
                            : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    ✨ This makes you discoverable in OpenGalexy
                </div>
            </div>
        </div>
    )
}
