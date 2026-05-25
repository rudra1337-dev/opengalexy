import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getSocket } from '../services/socketService'

const FILE_CHUNK_SIZE = 16 * 1024
const BUFFER_THRESHOLD = 64 * 1024

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useNearby = () => {
    const { user } = useSelector((state) => state.auth)
    const socket = getSocket()
    const [nearbyDevices, setNearbyDevices] = useState([])
    const [selectedDeviceId, setSelectedDeviceId] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [transfers, setTransfers] = useState([])
    const [incomingRequests, setIncomingRequests] = useState([])
    const [isScanning, setIsScanning] = useState(true)

    const peerConnectionsRef = useRef({})
    const nearbyDevicesRef = useRef([])
    const transfersRef = useRef([])
    const pendingOutgoingRef = useRef({})
    const acceptedIncomingRef = useRef({})
    const pendingIceCandidatesRef = useRef({})

    useEffect(() => {
        nearbyDevicesRef.current = nearbyDevices
    }, [nearbyDevices])

    useEffect(() => {
        transfersRef.current = transfers
    }, [transfers])

    useEffect(() => {
        if (!socket || !user) return undefined

        const announcePresence = () => {
            setIsScanning(true)
            socket.emit('nearby-announce', {
                userId: user._id,
                username: user.username
            })
        }

        const handleNearbyUsers = (devices) => {
            setNearbyDevices(devices)
            setIsScanning(false)
        }

        const handleUserJoined = (device) => {
            setNearbyDevices((prev) => {
                if (prev.some((item) => item.userId === device.userId)) {
                    return prev
                }

                return [...prev, device]
            })
            setIsScanning(false)
        }

        const handleUserLeft = ({ userId }) => {
            setNearbyDevices((prev) => prev.filter((item) => item.userId !== userId))
            setSelectedDeviceId((prev) => (prev === userId ? null : prev))

            setIncomingRequests((prev) =>
                prev.filter((request) => request.from !== userId)
            )

            Object.entries(acceptedIncomingRef.current).forEach(
                ([requestId, request]) => {
                    if (request.from === userId) {
                        delete acceptedIncomingRef.current[requestId]
                    }
                }
            )
        }

        const handleTransferRequest = ({ requestId, from, fromUsername, file }) => {
            setIncomingRequests((prev) => {
                if (prev.some((request) => request.requestId === requestId)) {
                    return prev
                }

                return [
                    {
                        requestId,
                        from,
                        fromUsername,
                        file
                    },
                    ...prev
                ]
            })

            setSelectedDeviceId((prev) => prev || from)
        }

        const handleTransferResponse = async ({
            requestId,
            accepted,
            from,
            reason
        }) => {
            const pendingRequest = pendingOutgoingRef.current[requestId]
            if (!pendingRequest) return

            if (!accepted) {
                updateTransfer(setTransfers, requestId, {
                    status: reason === 'declined' ? 'declined' : 'cancelled'
                })
                cleanupRequest(requestId, peerConnectionsRef, pendingOutgoingRef)
                return
            }

            updateTransfer(setTransfers, requestId, {
                status: 'connecting'
            })

            await startOutgoingTransfer({
                requestId,
                peerUserId: from,
                selectedFile: pendingRequest.file,
                socket,
                peerConnectionsRef,
                pendingIceCandidatesRef,
                transfersRef,
                setTransfers,
                peerUsername: pendingRequest.device.username
            })
        }

        const handleOffer = async ({ from, requestId, offer }) => {
            const acceptedRequest = acceptedIncomingRef.current[requestId]
            if (!acceptedRequest) return

            const pc = createPeerConnection({
                requestId,
                peerUserId: from,
                isSender: false,
                socket,
                peerConnectionsRef,
                pendingIceCandidatesRef,
                nearbyDevicesRef,
                transfersRef,
                setTransfers
            })

            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            await flushPendingIceCandidates({
                requestId,
                pc,
                pendingIceCandidatesRef
            })
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            socket.emit('nearby-answer', {
                to: from,
                requestId,
                answer
            })
        }

        const handleAnswer = async ({ requestId, answer }) => {
            const pc = peerConnectionsRef.current[requestId]
            if (!pc) return

            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            await flushPendingIceCandidates({
                requestId,
                pc,
                pendingIceCandidatesRef
            })
        }

        const handleIceCandidate = async ({ requestId, candidate }) => {
            const pc = peerConnectionsRef.current[requestId]
            const iceCandidate = new RTCIceCandidate(candidate)

            if (!pc || !pc.remoteDescription) {
                queueIceCandidate({
                    requestId,
                    iceCandidate,
                    pendingIceCandidatesRef
                })
                return
            }

            try {
                await pc.addIceCandidate(iceCandidate)
            } catch {
                queueIceCandidate({
                    requestId,
                    iceCandidate,
                    pendingIceCandidatesRef
                })
            }
        }

        const handleTransferCancelled = ({ requestId, reason }) => {
            updateTransfer(setTransfers, requestId, {
                status: reason === 'declined' ? 'declined' : 'cancelled'
            })

            setIncomingRequests((prev) =>
                prev.filter((request) => request.requestId !== requestId)
            )

            delete acceptedIncomingRef.current[requestId]
            cleanupRequest(requestId, peerConnectionsRef, pendingOutgoingRef)
        }

        socket.on('connect', announcePresence)
        socket.on('nearby-users', handleNearbyUsers)
        socket.on('nearby-user-joined', handleUserJoined)
        socket.on('nearby-user-left', handleUserLeft)
        socket.on('nearby-transfer-request', handleTransferRequest)
        socket.on('nearby-transfer-response', handleTransferResponse)
        socket.on('nearby-offer', handleOffer)
        socket.on('nearby-answer', handleAnswer)
        socket.on('nearby-ice-candidate', handleIceCandidate)
        socket.on('nearby-transfer-cancelled', handleTransferCancelled)

        announcePresence()

        return () => {
            socket.emit('nearby-leave')
            socket.off('connect', announcePresence)
            socket.off('nearby-users', handleNearbyUsers)
            socket.off('nearby-user-joined', handleUserJoined)
            socket.off('nearby-user-left', handleUserLeft)
            socket.off('nearby-transfer-request', handleTransferRequest)
            socket.off('nearby-transfer-response', handleTransferResponse)
            socket.off('nearby-offer', handleOffer)
            socket.off('nearby-answer', handleAnswer)
            socket.off('nearby-ice-candidate', handleIceCandidate)
            socket.off('nearby-transfer-cancelled', handleTransferCancelled)

            Object.values(peerConnectionsRef.current).forEach((connection) =>
                connection?.close()
            )

            peerConnectionsRef.current = {}
            pendingOutgoingRef.current = {}
            acceptedIncomingRef.current = {}
            pendingIceCandidatesRef.current = {}
        }
    }, [socket, user])

    const resolvedSelectedDeviceId = nearbyDevices.some(
        (device) => device.userId === selectedDeviceId
    )
        ? selectedDeviceId
        : nearbyDevices[0]?.userId || incomingRequests[0]?.from || null

    const selectedDevice = useMemo(
        () =>
            nearbyDevices.find(
                (device) => device.userId === resolvedSelectedDeviceId
            ) || null,
        [nearbyDevices, resolvedSelectedDeviceId]
    )

    const selectedIncomingRequest = useMemo(
        () =>
            incomingRequests.find((request) => request.from === resolvedSelectedDeviceId) ||
            incomingRequests[0] ||
            null,
        [incomingRequests, resolvedSelectedDeviceId]
    )

    const activeTransfersCount = transfers.filter((transfer) =>
        ['requesting', 'connecting', 'sending', 'receiving'].includes(
            transfer.status
        )
    ).length

    const completedTransfersCount = transfers.filter(
        (transfer) => transfer.status === 'done'
    ).length

    const selectDevice = (deviceId) => {
        setSelectedDeviceId(deviceId)
    }

    const clearSelectedFile = () => {
        setSelectedFile(null)
    }

    const requestSendToDevice = async (device) => {
        if (!device || !selectedFile || !socket) return false

        const requestId = createId()
        pendingOutgoingRef.current[requestId] = {
            file: selectedFile,
            device
        }

        setSelectedDeviceId(device.userId)
        setTransfers((prev) => [
            {
                id: requestId,
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                status: 'requesting',
                progress: 0,
                peerUsername: device.username,
                direction: 'outgoing'
            },
            ...prev
        ])

        socket.emit('nearby-transfer-request', {
            requestId,
            to: device.userId,
            file: {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type
            }
        })

        return true
    }

    const sendToSelectedDevice = async () => {
        if (!selectedDevice) return false
        return requestSendToDevice(selectedDevice)
    }

    const acceptIncomingRequest = (requestId) => {
        const request = incomingRequests.find((item) => item.requestId === requestId)
        if (!request || !socket) return

        acceptedIncomingRef.current[requestId] = request

        setIncomingRequests((prev) =>
            prev.filter((item) => item.requestId !== requestId)
        )

        setTransfers((prev) => [
            {
                id: requestId,
                fileName: request.file.name,
                fileSize: request.file.size,
                status: 'connecting',
                progress: 0,
                peerUsername: request.fromUsername,
                direction: 'incoming'
            },
            ...prev
        ])

        socket.emit('nearby-transfer-response', {
            requestId,
            to: request.from,
            accepted: true
        })
    }

    const declineIncomingRequest = (requestId) => {
        const request = incomingRequests.find((item) => item.requestId === requestId)
        if (!request || !socket) return

        setIncomingRequests((prev) =>
            prev.filter((item) => item.requestId !== requestId)
        )

        socket.emit('nearby-transfer-response', {
            requestId,
            to: request.from,
            accepted: false,
            reason: 'declined'
        })
    }

    return {
        nearbyDevices,
        selectedDevice,
        selectedDeviceId: resolvedSelectedDeviceId,
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
        onSendToDevice: requestSendToDevice,
        acceptIncomingRequest,
        declineIncomingRequest
    }
}

const startOutgoingTransfer = async ({
    requestId,
    peerUserId,
    selectedFile,
    socket,
    peerConnectionsRef,
    pendingIceCandidatesRef,
    transfersRef,
    setTransfers,
    peerUsername
}) => {
    const pc = createPeerConnection({
        requestId,
        peerUserId,
        isSender: true,
        socket,
        peerConnectionsRef,
        pendingIceCandidatesRef,
        nearbyDevicesRef: { current: [] },
        transfersRef,
        setTransfers
    })

    const channel = pc.createDataChannel('fileTransfer')
    channel.bufferedAmountLowThreshold = BUFFER_THRESHOLD

    channel.onopen = async () => {
        try {
            updateTransfer(setTransfers, requestId, {
                status: 'sending'
            })

            channel.send(
                JSON.stringify({
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                })
            )

            const buffer = await selectedFile.arrayBuffer()
            let offset = 0

            const sendChunk = () => {
                while (offset < buffer.byteLength) {
                    if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
                        channel.onbufferedamountlow = () => {
                            channel.onbufferedamountlow = null
                            sendChunk()
                        }
                        return
                    }

                    const chunk = buffer.slice(offset, offset + FILE_CHUNK_SIZE)
                    channel.send(chunk)
                    offset += FILE_CHUNK_SIZE

                    updateTransfer(setTransfers, requestId, {
                        progress: Math.min(
                            Math.round((offset / buffer.byteLength) * 100),
                            100
                        ),
                        peerUsername,
                        fileSize: selectedFile.size
                    })
                }

                updateTransfer(setTransfers, requestId, {
                    status: 'done',
                    progress: 100
                })

                socket.emit('nearby-transfer-complete', { requestId })
            }

            sendChunk()
        } catch {
            updateTransfer(setTransfers, requestId, {
                status: 'failed'
            })
        }
    }

    channel.onerror = () => {
        updateTransfer(setTransfers, requestId, {
            status: 'failed'
        })
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    socket.emit('nearby-offer', {
        to: peerUserId,
        requestId,
        offer
    })
}

const createPeerConnection = ({
    requestId,
    peerUserId,
    isSender,
    socket,
    peerConnectionsRef,
    nearbyDevicesRef,
    transfersRef,
    setTransfers
}) => {
    const existingConnection = peerConnectionsRef.current[requestId]
    if (existingConnection) return existingConnection

    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    peerConnectionsRef.current[requestId] = pc

    pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.emit('nearby-ice-candidate', {
                to: peerUserId,
                requestId,
                candidate
            })
        }
    }

    if (!isSender) {
        pc.ondatachannel = ({ channel }) => {
            setupReceiveChannel({
                channel,
                requestId,
                peerUserId,
                nearbyDevicesRef,
                socket,
                setTransfers
            })
        }
    }

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            updateTransfer(setTransfers, requestId, {
                status: isSender ? 'sending' : 'receiving'
            })
        }

        if (
            ['failed', 'closed', 'disconnected'].includes(pc.connectionState)
        ) {
            const currentTransfer = transfersRef.current.find(
                (transfer) => transfer.id === requestId
            )

            if (
                !currentTransfer ||
                !['done', 'cancelled', 'declined'].includes(
                    currentTransfer.status
                )
            ) {
                updateTransfer(setTransfers, requestId, {
                    status: 'failed'
                })
            }
        }
    }

    return pc
}

const setupReceiveChannel = ({
    channel,
    requestId,
    peerUserId,
    nearbyDevicesRef,
    socket,
    setTransfers
}) => {
    let receivedChunks = []
    let fileName = ''
    let fileSize = 0

    channel.onmessage = ({ data }) => {
        if (typeof data === 'string') {
            const meta = JSON.parse(data)
            fileName = meta.name
            fileSize = meta.size

            const peerUsername = getPeerUsername(nearbyDevicesRef, peerUserId)

            updateTransfer(setTransfers, requestId, {
                fileName: meta.name,
                fileSize: meta.size,
                peerUsername,
                status: 'receiving'
            })
            return
        }

        receivedChunks.push(data)
        const receivedBytes = receivedChunks.reduce(
            (total, chunk) => total + chunk.byteLength,
            0
        )

        updateTransfer(setTransfers, requestId, {
            progress: Math.round((receivedBytes / fileSize) * 100)
        })

        if (receivedBytes >= fileSize) {
            const blob = new Blob(receivedChunks)
            const url = URL.createObjectURL(blob)
            const downloadLink = document.createElement('a')
            downloadLink.href = url
            downloadLink.download = fileName
            downloadLink.click()
            URL.revokeObjectURL(url)

            updateTransfer(setTransfers, requestId, {
                status: 'done',
                progress: 100
            })

            socket.emit('nearby-transfer-complete', { requestId })
            receivedChunks = []
        }
    }

    channel.onerror = () => {
        updateTransfer(setTransfers, requestId, {
            status: 'failed'
        })
    }
}

const getPeerUsername = (nearbyDevicesRef, peerUserId) =>
    nearbyDevicesRef.current.find((device) => device.userId === peerUserId)
        ?.username

const queueIceCandidate = ({
    requestId,
    iceCandidate,
    pendingIceCandidatesRef
}) => {
    pendingIceCandidatesRef.current[requestId] = [
        ...(pendingIceCandidatesRef.current[requestId] || []),
        iceCandidate
    ]
}

const flushPendingIceCandidates = async ({
    requestId,
    pc,
    pendingIceCandidatesRef
}) => {
    const pendingCandidates = pendingIceCandidatesRef.current[requestId] || []
    if (pendingCandidates.length === 0) return

    delete pendingIceCandidatesRef.current[requestId]

    for (const candidate of pendingCandidates) {
        try {
            await pc.addIceCandidate(candidate)
        } catch {
            queueIceCandidate({
                requestId,
                iceCandidate: candidate,
                pendingIceCandidatesRef
            })
            break
        }
    }
}

const cleanupRequest = (requestId, peerConnectionsRef, pendingOutgoingRef) => {
    peerConnectionsRef.current[requestId]?.close()
    delete peerConnectionsRef.current[requestId]
    delete pendingOutgoingRef.current[requestId]
}

const updateTransfer = (setTransfers, requestId, patch) => {
    setTransfers((prev) =>
        prev.map((transfer) =>
            transfer.id === requestId ? { ...transfer, ...patch } : transfer
        )
    )
}
