import { WEBRTC_ICE_SERVERS } from '../utils/constants'

let peerConnection = null
let localStream = null
let remoteStream = null
let currentCall = null
let pendingCandidatesByCallId = new Map()
let pendingStart = null
let streamCallbacks = {
    onLocalStream: null,
    onRemoteStream: null,
    onConnectionStateChange: null
}

const createCallId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID()
    return `call-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getMedia = async (callType) => {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support camera or microphone calls.')
    }

    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        },
        video:
            callType === 'video'
                ? {
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                      facingMode: 'user'
                  }
                : false
    })
}

const stopStream = (stream) => {
    stream?.getTracks().forEach((track) => track.stop())
}

const getSessionKey = ({ mode, roomId, peerUserId, callId, callType }) =>
    [mode, roomId, peerUserId, callId, callType].join(':')

const normalizeMediaError = (error, callType) => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        return new Error('Calls require HTTPS outside localhost.')
    }

    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
        return new Error('Camera or microphone permission was denied.')
    }

    if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        return new Error(
            callType === 'video'
                ? 'No camera or microphone was found.'
                : 'No microphone was found.'
        )
    }

    if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
        return new Error('Camera or microphone is already in use.')
    }

    return error
}

const setStreamCallbacks = ({
    onLocalStream,
    onRemoteStream,
    onConnectionStateChange
}) => {
    streamCallbacks = {
        onLocalStream,
        onRemoteStream,
        onConnectionStateChange
    }
}

const resetSession = ({ stopLocal = true, preserveCandidatesForCallId = null } = {}) => {
    const preservedCandidates = preserveCandidatesForCallId
        ? pendingCandidatesByCallId.get(preserveCandidatesForCallId)
        : null

    if (peerConnection) {
        peerConnection.onicecandidate = null
        peerConnection.ontrack = null
        peerConnection.onconnectionstatechange = null
        peerConnection.close()
    }

    if (stopLocal) stopStream(localStream)

    peerConnection = null
    localStream = null
    remoteStream = null
    currentCall = null
    pendingCandidatesByCallId = new Map()
    if (preserveCandidatesForCallId && preservedCandidates) {
        pendingCandidatesByCallId.set(preserveCandidatesForCallId, preservedCandidates)
    }
    pendingStart = null
    streamCallbacks = {
        onLocalStream: null,
        onRemoteStream: null,
        onConnectionStateChange: null
    }
}

const createPeerConnection = ({
    socket,
    peerUserId,
    roomId,
    callId
}) => {
    const pc = new RTCPeerConnection({ iceServers: WEBRTC_ICE_SERVERS })
    remoteStream = new MediaStream()

    pc.onicecandidate = (event) => {
        if (!event.candidate) return
        socket.emit('call-ice-candidate', {
            to: peerUserId,
            roomId,
            callId,
            candidate: event.candidate
        })
    }

    pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
            if (!remoteStream.getTracks().some((item) => item.id === track.id)) {
                remoteStream.addTrack(track)
            }
        })
        streamCallbacks.onRemoteStream?.(new MediaStream(remoteStream.getTracks()))
    }

    pc.onconnectionstatechange = () => {
        streamCallbacks.onConnectionStateChange?.(pc.connectionState)
    }

    return pc
}

const getPendingCandidates = (callId) => pendingCandidatesByCallId.get(callId) || []

const queuePendingCandidate = (callId, candidate) => {
    const candidates = getPendingCandidates(callId)
    pendingCandidatesByCallId.set(callId, [...candidates, candidate])
}

const flushPendingCandidates = async (callId = currentCall?.callId) => {
    if (!callId || !peerConnection?.remoteDescription) return

    const candidates = getPendingCandidates(callId)
    pendingCandidatesByCallId.delete(callId)

    await Promise.all(
        candidates.map((candidate) =>
            peerConnection.addIceCandidate(candidate).catch((error) => {
                console.warn('Unable to add buffered ICE candidate:', error)
            })
        )
    )
}

const prepareSession = async ({
    socket,
    roomId,
    peerUserId,
    callType,
    callId,
    onLocalStream,
    onRemoteStream,
    onConnectionStateChange
}) => {
    resetSession({ preserveCandidatesForCallId: callId })
    setStreamCallbacks({
        onLocalStream,
        onRemoteStream,
        onConnectionStateChange
    })

    try {
        localStream = await getMedia(callType)
    } catch (error) {
        throw normalizeMediaError(error, callType)
    }
    streamCallbacks.onLocalStream?.(localStream)

    peerConnection = createPeerConnection({
        socket,
        peerUserId,
        roomId,
        callId
    })

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    currentCall = {
        roomId,
        peerUserId,
        callType,
        callId,
        startedAt: new Date().toISOString()
    }

    return { peerConnection, localStream, callId }
}

export const callService = {
    startOutgoingCall: async ({
        socket,
        roomId,
        peerUserId,
        callType,
        onLocalStream,
        onRemoteStream,
        onConnectionStateChange
    }) => {
        const key = getSessionKey({
            mode: 'outgoing',
            roomId,
            peerUserId,
            callId: 'new',
            callType
        })

        if (pendingStart?.key === key) {
            setStreamCallbacks({
                onLocalStream,
                onRemoteStream,
                onConnectionStateChange
            })
            if (localStream) streamCallbacks.onLocalStream?.(localStream)
            if (remoteStream) {
                streamCallbacks.onRemoteStream?.(
                    new MediaStream(remoteStream.getTracks())
                )
            }
            return pendingStart.promise
        }

        const callId = createCallId()

        const start = async () => {
            const session = await prepareSession({
                socket,
                roomId,
                peerUserId,
                callType,
                callId,
                onLocalStream,
                onRemoteStream,
                onConnectionStateChange
            })

            const offer = await session.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: callType === 'video'
            })
            await session.peerConnection.setLocalDescription(offer)

            socket.emit('call-offer', {
                to: peerUserId,
                roomId,
                callType,
                callId,
                offer
            })

            return currentCall
        }

        pendingStart = {
            key,
            promise: start().finally(() => {
                pendingStart = null
            })
        }

        return pendingStart.promise
    },

    answerIncomingCall: async ({
        socket,
        incomingCall,
        onLocalStream,
        onRemoteStream,
        onConnectionStateChange
    }) => {
        if (!incomingCall) {
            throw new Error('Incoming call details are no longer available.')
        }

        const key = getSessionKey({
            mode: 'incoming',
            roomId: incomingCall.roomId,
            peerUserId: incomingCall.from,
            callId: incomingCall.callId,
            callType: incomingCall.callType
        })

        if (pendingStart?.key === key) {
            setStreamCallbacks({
                onLocalStream,
                onRemoteStream,
                onConnectionStateChange
            })
            if (localStream) streamCallbacks.onLocalStream?.(localStream)
            if (remoteStream) {
                streamCallbacks.onRemoteStream?.(
                    new MediaStream(remoteStream.getTracks())
                )
            }
            return pendingStart.promise
        }

        if (currentCall?.callId === incomingCall.callId) {
            setStreamCallbacks({
                onLocalStream,
                onRemoteStream,
                onConnectionStateChange
            })
            if (localStream) streamCallbacks.onLocalStream?.(localStream)
            if (remoteStream) {
                streamCallbacks.onRemoteStream?.(
                    new MediaStream(remoteStream.getTracks())
                )
            }
            return currentCall
        }

        const start = async () => {
            const session = await prepareSession({
                socket,
                roomId: incomingCall.roomId,
                peerUserId: incomingCall.from,
                callType: incomingCall.callType,
                callId: incomingCall.callId,
                onLocalStream,
                onRemoteStream,
                onConnectionStateChange
            })

            await session.peerConnection.setRemoteDescription(
                new RTCSessionDescription(incomingCall.offer)
            )

            const answer = await session.peerConnection.createAnswer()
            await session.peerConnection.setLocalDescription(answer)
            await flushPendingCandidates(incomingCall.callId)

            socket.emit('call-answer', {
                to: incomingCall.from,
                roomId: incomingCall.roomId,
                callId: incomingCall.callId,
                answer
            })

            return currentCall
        }

        pendingStart = {
            key,
            promise: start().finally(() => {
                pendingStart = null
            })
        }

        return pendingStart.promise
    },

    handleAnswer: async ({ answer, callId }) => {
        if (!answer || currentCall?.callId !== callId) return
        if (!peerConnection) return

        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
        )
        await flushPendingCandidates(callId)
    },

    handleIceCandidate: async ({ candidate, callId }) => {
        if (!candidate || !callId) return
        const iceCandidate = new RTCIceCandidate(candidate)

        if (currentCall?.callId !== callId || !peerConnection) {
            queuePendingCandidate(callId, iceCandidate)
            return
        }

        if (!peerConnection?.remoteDescription) {
            queuePendingCandidate(callId, iceCandidate)
            return
        }

        await peerConnection.addIceCandidate(iceCandidate)
    },

    toggleAudio: () => {
        const audioTrack = localStream?.getAudioTracks()[0]
        if (!audioTrack) return false
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
    },

    toggleVideo: () => {
        const videoTrack = localStream?.getVideoTracks()[0]
        if (!videoTrack) return false
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
    },

    endCall: ({ socket, reason = 'ended' } = {}) => {
        const call = currentCall
        resetSession()

        if (socket && call?.peerUserId) {
            socket.emit('call-end', {
                to: call.peerUserId,
                roomId: call.roomId,
                callId: call.callId,
                reason
            })
        }
    },

    cleanup: resetSession,

    getCurrentCall: () => currentCall,

    hasActiveSession: () => Boolean(currentCall || pendingStart)
}
