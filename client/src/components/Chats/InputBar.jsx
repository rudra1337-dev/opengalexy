import { useState, useRef, useEffect } from 'react'
import { validateMessage } from '../../utils/validators'
import styles from '../../styles/Chats/InputBar.module.css'

export default function InputBar({ onSendMessage, onTyping, isLoading }) {
    const [content, setContent] = useState('')
    const [isTemp, setIsTemp] = useState(false)
    const [tempDuration, setTempDuration] = useState('1h')
    const textareaRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 100) + 'px'
        }
    }, [content])

    const handleInputChange = (e) => {
        setContent(e.target.value)

        if (onTyping && e.target.value.trim()) {
            onTyping(true)

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }

            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false)
            }, 3000)
        } else if (onTyping) {
            onTyping(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const validation = validateMessage(content)
        if (!validation.valid) {
            return
        }

        onSendMessage({
            content: content.trim(),
            isTemp,
            duration: isTemp ? tempDuration : null,
            type: 'text'
        })

        setContent('')
        setIsTemp(false)
        onTyping(false)

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
    }

    const canSend = content.trim().length > 0 && !isLoading

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputWrapper}>
                    <div className={styles.controls}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            title="Emoji reactions coming soon"
                        >
                            🙂
                        </button>
                        <button
                            type="button"
                            className={styles.iconButton}
                            title="Attachments coming soon"
                        >
                            +
                        </button>
                        <div className={styles.tempToggle}>
                            <span>⏱ Temp</span>
                            <button
                                type="button"
                                className={`${styles.toggle} ${isTemp ? styles.active : ''}`}
                                onClick={() => setIsTemp(!isTemp)}
                                title={
                                    isTemp
                                        ? 'Message will auto-delete'
                                        : 'Message is permanent'
                                }
                            >
                                <div className={styles.toggleSlider}></div>
                            </button>
                            {isTemp && (
                                <select
                                    value={tempDuration}
                                    onChange={(e) =>
                                        setTempDuration(e.target.value)
                                    }
                                    className={styles.durationSelect}
                                >
                                    <option value="5m">5m</option>
                                    <option value="1h">1h</option>
                                    <option value="24h">24h</option>
                                    <option value="7d">7d</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleInputChange}
                        placeholder="Type a message"
                        className={styles.input}
                        rows="1"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="button"
                    className={styles.voiceButton}
                    title="Voice notes coming soon"
                >
                    🎙️
                </button>

                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!canSend}
                    title="Send message"
                >
                    {isLoading ? '⏳' : '↑'}
                </button>
            </form>
        </div>
    )
}
