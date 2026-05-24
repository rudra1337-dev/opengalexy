import FileSelector from './FileSelector'
import NearbyDeviceList from './NearbyDeviceList'
import TransferProgress from './TransferProgress'
import styles from '../../styles/NearbyShare/NearbyScreen.module.css'

export default function NearbyScreen({ mode = 'sidebar', nearby }) {
    const {
        nearbyDevices,
        selectedDevice,
        selectedDeviceId,
        selectedFile,
        transfers,
        incomingRequests,
        selectedIncomingRequest,
        isScanning,
        activeTransfersCount,
        completedTransfersCount,
        setSelectedFile,
        clearSelectedFile,
        selectDevice,
        sendToSelectedDevice,
        onSendToDevice,
        acceptIncomingRequest,
        declineIncomingRequest
    } = nearby

    const latestTransfers = transfers.slice(0, 4)
    const deviceCount = nearbyDevices.length
    const shareHeroTitle = selectedDevice
        ? `Share with @${selectedDevice.username}`
        : 'Pick a nearby device to begin'
    const shareHeroText = selectedDevice
        ? selectedFile
            ? `Your file is ready to send as soon as ${selectedDevice.username} accepts the request.`
            : `Choose a file first, then send it straight to ${selectedDevice.username}.`
        : isScanning
          ? 'We are checking who currently has Nearby Share open.'
          : 'No device selected yet. Choose one from the left panel when it appears.'

    const detailHeroSection = (
        <section className={styles.heroCard}>
            <div className={styles.heroTop}>
                <span className={styles.heroBadge}>
                    {isScanning ? 'Scanning now' : 'Ready to share'}
                </span>
                <span className={styles.heroMeta}>{deviceCount} live</span>
            </div>

            <div className={styles.heroBody}>
                <div className={styles.radarWrap}>
                    <div className={styles.radarBackdrop}>
                        <span className={styles.radarRing}></span>
                        <span className={styles.radarRing}></span>
                        <span className={styles.radarRing}></span>
                        <div className={styles.beaconCore}>📡</div>
                    </div>
                </div>

                <div className={styles.heroContent}>
                    <h2 className={styles.heroTitle}>{shareHeroTitle}</h2>
                    <p className={styles.heroText}>{shareHeroText}</p>

                    <div className={styles.quickStats}>
                        <div className={styles.statCard}>
                            <strong>{deviceCount}</strong>
                            <span>devices</span>
                        </div>
                        <div className={styles.statCard}>
                            <strong>{activeTransfersCount}</strong>
                            <span>active</span>
                        </div>
                        <div className={styles.statCard}>
                            <strong>{completedTransfersCount}</strong>
                            <span>done</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

    const detailPanelSections = (
        <div className={styles.detailGrid}>
            <section className={styles.panelCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Share Preview</h3>
                        <p className={styles.sectionText}>
                            Review the destination and file before sending.
                        </p>
                    </div>
                </div>

                {selectedIncomingRequest ? (
                    <div className={styles.requestCard}>
                        <div className={styles.requestBadge}>
                            Incoming request
                        </div>
                        <strong className={styles.requestTitle}>
                            @{selectedIncomingRequest.fromUsername} wants to send{' '}
                            {selectedIncomingRequest.file.name}
                        </strong>
                        <span className={styles.requestMeta}>
                            {formatBytes(selectedIncomingRequest.file.size)} •{' '}
                            {selectedIncomingRequest.file.type ||
                                'Unknown file type'}
                        </span>
                        <div className={styles.requestActions}>
                            <button
                                type="button"
                                className={styles.secondaryAction}
                                onClick={() =>
                                    declineIncomingRequest(
                                        selectedIncomingRequest.requestId
                                    )
                                }
                            >
                                Decline
                            </button>
                            <button
                                type="button"
                                className={styles.primaryActionCompact}
                                onClick={() =>
                                    acceptIncomingRequest(
                                        selectedIncomingRequest.requestId
                                    )
                                }
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                ) : null}

                {selectedDevice ? (
                    <div className={styles.selectedDeviceCard}>
                        <div className={styles.selectedDeviceAvatar}>
                            {selectedDevice.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.selectedDeviceInfo}>
                            <strong>@{selectedDevice.username}</strong>
                            <span>Available for Nearby Share right now</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyPanel}>
                        <span className={styles.emptyIcon}>🛰️</span>
                        <div>No destination selected yet</div>
                    </div>
                )}

                {selectedFile ? (
                    <div className={styles.filePreview}>
                        <span className={styles.filePreviewLabel}>
                            Ready to send
                        </span>
                        <strong className={styles.filePreviewName}>
                            {selectedFile.name}
                        </strong>
                        <span className={styles.filePreviewMeta}>
                            {formatBytes(selectedFile.size)}
                        </span>
                    </div>
                ) : (
                    <div className={styles.emptyPanelMuted}>
                        Select a file in the sidebar to prepare a transfer.
                    </div>
                )}

                <button
                    type="button"
                    className={styles.primaryAction}
                    disabled={!selectedDevice || !selectedFile}
                    onClick={sendToSelectedDevice}
                >
                    {selectedDevice
                        ? `Send to @${selectedDevice.username}`
                        : 'Choose a device first'}
                </button>
            </section>

            <section className={styles.panelCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>
                            Transfer Activity
                        </h3>
                        <p className={styles.sectionText}>
                            Track uploads and incoming files in one place.
                        </p>
                    </div>
                </div>

                {latestTransfers.length > 0 ? (
                    <TransferProgress transfers={latestTransfers} />
                ) : (
                    <div className={styles.emptyPanel}>
                        <span className={styles.emptyIcon}>✨</span>
                        <div>No transfers yet</div>
                        <small>Your recent activity will appear here.</small>
                    </div>
                )}

                <div className={styles.tipStack}>
                    <div className={styles.tipCard}>
                        <strong>Theme-friendly by default</strong>
                        <span>
                            Colors, borders, and motion adapt to the current
                            light or dark theme.
                        </span>
                    </div>
                    <div className={styles.tipCard}>
                        <strong>Best results</strong>
                        <span>
                            Both people should keep Nearby Share open until the
                            transfer finishes.
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )

    if (mode === 'detail') {
        return (
            <div className={`${styles.container} ${styles.detailSurface}`}>
                <div className={styles.detailCanvas}>
                    {detailHeroSection}
                    {detailPanelSections}
                </div>
            </div>
        )
    }

    return (
        <div className={`${styles.container} ${styles.sidebarSurface}`}>
            <div className={styles.mobileDetailStack}>{detailHeroSection}</div>

            <section className={styles.sidebarHero}>
                <div className={styles.sidebarHeroTop}>
                    <span className={styles.heroBadge}>
                        {isScanning ? 'Scanning' : 'Nearby Share'}
                    </span>
                    <span className={styles.heroMeta}>
                        {deviceCount} device{deviceCount === 1 ? '' : 's'}
                    </span>
                </div>

                <div className={styles.sidebarHeroCopy}>
                    <h2 className={styles.sidebarTitle}>Nearby Share</h2>
                    <p className={styles.sidebarText}>
                        Drop a file, choose someone who is live, and send it
                        after they approve the request.
                    </p>
                </div>

                <div className={styles.metricsRow}>
                    <div className={styles.metricPill}>
                        <span>Scan</span>
                        <strong>{isScanning ? 'Looking' : 'Live'}</strong>
                    </div>
                    <div className={styles.metricPill}>
                        <span>Transfers</span>
                        <strong>{activeTransfersCount} active</strong>
                    </div>
                    <div className={styles.metricPill}>
                        <span>Requests</span>
                        <strong>{incomingRequests.length} waiting</strong>
                    </div>
                </div>
            </section>

            <section className={styles.panelCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Choose a file</h3>
                        <p className={styles.sectionText}>
                            Images, docs, archives, and more are supported.
                        </p>
                    </div>
                </div>

                <FileSelector
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    onClear={clearSelectedFile}
                />
            </section>

            <section className={styles.panelCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3 className={styles.sectionTitle}>Nearby devices</h3>
                        <p className={styles.sectionText}>
                            Pick a device and send instantly when your file is
                            ready.
                        </p>
                    </div>
                </div>

                <NearbyDeviceList
                    devices={nearbyDevices}
                    isScanning={isScanning}
                    selectedDeviceId={selectedDeviceId}
                    onSelectDevice={selectDevice}
                    onSendToDevice={onSendToDevice}
                    selectedFile={selectedFile}
                />
            </section>

            <div className={styles.mobileDetailStack}>{detailPanelSections}</div>
        </div>
    )
}

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
