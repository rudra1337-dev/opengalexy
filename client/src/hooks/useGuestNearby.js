import { useMemo, useState } from 'react'
import {
    guestNearbyDevices,
    guestTransfers
} from '../mocks/guestData'

const createId = () => `guest-transfer-${Date.now()}`

export const useGuestNearby = () => {
    const [nearbyDevices] = useState(guestNearbyDevices)
    const [selectedDeviceId, setSelectedDeviceId] = useState(
        guestNearbyDevices[0]?.userId || null
    )
    const [selectedFile, setSelectedFile] = useState(null)
    const [transfers, setTransfers] = useState(guestTransfers)
    const [incomingRequests, setIncomingRequests] = useState([])
    const [isScanning] = useState(false)

    const selectedDevice = useMemo(
        () => nearbyDevices.find((device) => device.userId === selectedDeviceId) || null,
        [nearbyDevices, selectedDeviceId]
    )

    const clearSelectedFile = () => {
        setSelectedFile(null)
    }

    const selectDevice = (userId) => {
        setSelectedDeviceId(userId)
    }

    const pushDemoTransfer = (device) => {
        if (!selectedFile || !device) return

        setTransfers((prev) => [
            {
                id: createId(),
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                status: 'requesting',
                direction: 'outgoing',
                peerUsername: device.username,
                progress: 0
            },
            ...prev
        ])
    }

    const onSendToDevice = (device) => {
        selectDevice(device.userId)
        pushDemoTransfer(device)
    }

    const sendToSelectedDevice = () => {
        pushDemoTransfer(selectedDevice)
    }

    const acceptIncomingRequest = (requestId) => {
        setIncomingRequests((prev) =>
            prev.filter((request) => request.requestId !== requestId)
        )
    }

    const declineIncomingRequest = (requestId) => {
        setIncomingRequests((prev) =>
            prev.filter((request) => request.requestId !== requestId)
        )
    }

    return {
        nearbyDevices,
        selectedDevice,
        selectedDeviceId,
        selectedFile,
        transfers,
        incomingRequests,
        selectedIncomingRequest: incomingRequests[0] || null,
        isScanning,
        activeTransfersCount: transfers.filter((item) =>
            ['requesting', 'connecting', 'sending', 'receiving'].includes(item.status)
        ).length,
        completedTransfersCount: transfers.filter(
            (item) => item.status === 'done'
        ).length,
        setSelectedFile,
        clearSelectedFile,
        selectDevice,
        sendToSelectedDevice,
        onSendToDevice,
        acceptIncomingRequest,
        declineIncomingRequest
    }
}

export default useGuestNearby
