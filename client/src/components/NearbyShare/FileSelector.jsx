import { useRef, useState } from 'react'
import styles from '../../styles/NearbyShare/FileSelector.module.css'

export default function FileSelector({ selectedFile, onFileSelect, onClear }) {
    const inputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)

    const openPicker = () => {
        inputRef.current?.click()
    }

    const handleDrop = (event) => {
        event.preventDefault()
        setIsDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFileSelect(file)
    }

    const handleInputChange = (event) => {
        const file = event.target.files[0]
        if (file) onFileSelect(file)
    }

    if (selectedFile) {
        return (
            <div className={styles.fileCard}>
                <div className={styles.fileLead}>
                    <div className={styles.fileIconWrap}>
                        <span className={styles.fileIcon}>
                            {getFileIcon(selectedFile.type)}
                        </span>
                    </div>

                    <div className={styles.fileMeta}>
                        <strong className={styles.fileName}>
                            {selectedFile.name}
                        </strong>
                        <div className={styles.fileMetaRow}>
                            <span className={styles.metaPill}>
                                {formatSize(selectedFile.size)}
                            </span>
                            <span className={styles.metaPill}>
                                {selectedFile.type || 'Unknown type'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.replaceBtn}
                        onClick={openPicker}
                    >
                        Replace
                    </button>
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={onClear}
                    >
                        Remove
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    className={styles.hiddenInput}
                    onChange={handleInputChange}
                />
            </div>
        )
    }

    return (
        <div
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
            onClick={openPicker}
            onDrop={handleDrop}
            onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPicker()
                }
            }}
        >
            <input
                ref={inputRef}
                type="file"
                className={styles.hiddenInput}
                onChange={handleInputChange}
            />

            <div className={styles.dropIconWrap}>
                <span className={styles.dropIcon}>📂</span>
            </div>
            <strong className={styles.dropTitle}>Drop a file here</strong>
            <p className={styles.dropText}>
                Tap to browse from this device or drag a file directly into the
                share zone.
            </p>
            <div className={styles.dropMeta}>
                <span className={styles.metaPill}>Images</span>
                <span className={styles.metaPill}>Documents</span>
                <span className={styles.metaPill}>Archives</span>
            </div>
        </div>
    )
}

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const getFileIcon = (type = '') => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip') || type.includes('rar')) return '🗜️'
    return '📁'
}
