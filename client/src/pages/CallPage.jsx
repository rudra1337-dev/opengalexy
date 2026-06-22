import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CallControls from '../components/Calls/CallControls'
import VideoPreview from '../components/Calls/VideoPreview'
import {
    endCall,
    setActiveCall,
    setCallStatus
} from '../redux/slices/callSlice'
import { setActiveChat, upsertChat } from '../redux/slices/chatsSlice'
import { callService } from '../services/callService'
import { chatService } from '../services/chatService'
import styles from '../styles/Calls/CallPage.module.css'

const readableState = {
    new: 'Starting',
    checking: 'Connecting',
    connected: 'Connected',
    completed: 'Connected',
    disconnected: 'Reconnecting',
    failed: 'Connection failed',
    closed: 'Ended'
}

const callStatusText = {
    idle: 'Preparing call',
    ringing: 'Ringing',
    accepting: 'Accepting call',
    connecting: 'Connecting',
    connected: 'Connected',
    reconnecting: 'Reconnecting',
    permission_denied: 'Permission denied',
    peer_offline: 'Contact is offline',
    declined: 'Call declined',
    failed_ice: 'Connection failed',
    failed: 'Call failed',
    ended: 'Call ended'
}

const getFailureStatus = (message = '') => {
    const normalizedMessage = message.toLowerCase()

    if (
        normalizedMessage.includes('permission') ||
        normalizedMessage.includes('denied') ||
        normalizedMessage.includes('https')
    ) {
        return 'permission_denied'
    }

    if (normalizedMessage.includes('offline')) return 'peer_offline'

    return 'failed'
}

export default function CallPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { roomId } = useParams()
    const { socket } = useSelector((state) => state.socket)
    const { user } = useSelector((state) => state.auth)
    const { activeChat, chatList } = useSelector((state) => state.chats)
    const { incomingCall, acceptedCall, activeCall, status: reduxCallStatus } =
        useSelector((state) => state.call)

    const [loadedRoom, setLoadedRoom] = useState(null)
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [status, setStatus] = useState('Preparing call')
    const [error, setError] = useState('')
    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOff, setIsCameraOff] = useState(false)
    const startedRef = useRef(false)
    const endingRef = useRef(false)

    const callType =
        new URLSearchParams(location.search).get('type') === 'video'
            ? 'video'
            : 'audio'
    const mode = location.state?.mode === 'incoming' ? 'incoming' : 'outgoing'
    const incomingDraft =
        mode === 'incoming'
            ? acceptedCall || incomingCall || location.state?.incomingCall
            : null

    const chatListRoom = chatList.find((chat) => chat._id === roomId)
    const resolvedRoom =
        activeChat?._id === roomId ? activeChat : chatListRoom || loadedRoom
    const incomingUnavailable =
        mode === 'incoming' && incomingDraft?.roomId !== roomId
    const peerUser = useMemo(
        () =>
            resolvedRoom?.members?.find(
                (member) => member._id?.toString() !== user?._id?.toString()
            ),
        [resolvedRoom, user?._id]
    )

    const contactName =
        peerUser?.displayName ||
        peerUser?.username ||
        incomingDraft?.caller?.displayName ||
        incomingDraft?.caller?.username ||
        'OpenGalexy contact'

    useEffect(() => {
        const existingRoom =
            activeChat?._id === roomId
                ? activeChat
                : chatList.find((chat) => chat._id === roomId)

        if (existingRoom) {
            if (activeChat?._id !== existingRoom._id) {
                dispatch(setActiveChat(existingRoom))
            }
            return
        }

        let cancelled = false
        const loadRoom = async () => {
            try {
                const response = await chatService.getRoom(roomId)
                if (cancelled) return
                setLoadedRoom(response.data.room)
                dispatch(upsertChat(response.data.room))
                dispatch(setActiveChat(response.data.room))
            } catch (loadError) {
                if (cancelled) return
                setError(loadError.response?.data?.message || 'Unable to load call room.')
            }
        }

        loadRoom()

        return () => {
            cancelled = true
        }
    }, [activeChat, chatList, dispatch, roomId])

    useEffect(() => {
        if (!socket || !resolvedRoom || !peerUser || startedRef.current) return

        if (incomingUnavailable) return

        let cancelled = false
        startedRef.current = true

        const onLocalStream = (stream) => {
            if (!cancelled) setLocalStream(stream)
        }
        const onRemoteStream = (stream) => {
            if (!cancelled) setRemoteStream(stream)
        }
        const onConnectionStateChange = (state) => {
            if (cancelled) return

            const nextStatus =
                state === 'disconnected'
                    ? 'reconnecting'
                    : state === 'failed'
                      ? 'failed_ice'
                      : state === 'connected' || state === 'completed'
                        ? 'connected'
                        : 'connecting'

            dispatch(setCallStatus(nextStatus))
            setStatus(readableState[state] || callStatusText[nextStatus] || state)
        }

        const start = async () => {
            try {
                const nextStatus = mode === 'incoming' ? 'accepting' : 'ringing'
                dispatch(setCallStatus(nextStatus))
                setStatus(callStatusText[nextStatus])

                const call =
                    mode === 'incoming'
                        ? await callService.answerIncomingCall({
                              socket,
                              incomingCall: incomingDraft,
                              onLocalStream,
                              onRemoteStream,
                              onConnectionStateChange
                          })
                        : await callService.startOutgoingCall({
                              socket,
                              roomId,
                              peerUserId: peerUser._id,
                              callType,
                              onLocalStream,
                              onRemoteStream,
                              onConnectionStateChange
                          })

                if (cancelled) return
                dispatch(
                    setActiveCall({
                        ...call,
                        with: peerUser._id,
                        contactName
                    })
                )
                const nextStatusAfterSetup =
                    mode === 'incoming' ? 'connected' : 'ringing'
                dispatch(setCallStatus(nextStatusAfterSetup))
                setStatus(callStatusText[nextStatusAfterSetup])
            } catch (callError) {
                if (cancelled) return
                startedRef.current = false
                const message =
                    callError?.message ||
                    'Unable to start the call. Check camera and microphone permissions.'
                const failureStatus = getFailureStatus(message)

                setError(message)
                dispatch(setCallStatus(failureStatus))
                setStatus(callStatusText[failureStatus])
                callService.cleanup()
            }
        }

        start()

        return () => {
            cancelled = true
        }
    }, [
        socket,
        resolvedRoom,
        peerUser,
        roomId,
        callType,
        mode,
        incomingDraft,
        incomingUnavailable,
        dispatch,
        contactName
    ])

    useEffect(() => {
        if (!socket) return undefined

        const handleAnswered = async (payload) => {
            try {
                await callService.handleAnswer(payload)
                dispatch(setCallStatus('connected'))
                setStatus('Connected')
            } catch (answerError) {
                setError(answerError.message)
                dispatch(setCallStatus('failed'))
            }
        }

        const handleIceCandidate = async (payload) => {
            try {
                await callService.handleIceCandidate(payload)
            } catch (candidateError) {
                console.warn('Unable to add call ICE candidate:', candidateError)
            }
        }

        const handleEnded = (payload) => {
            if (
                activeCall?.callId &&
                payload.callId &&
                payload.callId !== activeCall.callId
            ) {
                return
            }

            endingRef.current = true
            callService.cleanup()
            dispatch(setCallStatus('ended'))
            dispatch(endCall())
            setStatus(payload.reason === 'peer_disconnected' ? 'Peer disconnected' : 'Call ended')
            navigate('/home/chats', { replace: true })
        }

        const handleRejected = (payload) => {
            if (
                activeCall?.callId &&
                payload.callId &&
                payload.callId !== activeCall.callId
            ) {
                return
            }

            endingRef.current = true
            callService.cleanup()
            dispatch(
                setCallStatus(
                    payload.reason === 'unavailable'
                        ? 'peer_offline'
                        : payload.reason === 'busy' || payload.reason === 'rejected'
                          ? 'declined'
                          : 'failed'
                )
            )
            dispatch(endCall())
            setStatus(
                payload.reason === 'busy'
                    ? 'Contact is busy'
                    : payload.reason === 'unavailable'
                      ? 'Contact is offline'
                      : 'Call declined'
            )
            navigate('/home/chats', { replace: true })
        }

        const handleCallError = (payload) => {
            setError(payload.message || 'Call failed.')
            callService.cleanup()
            dispatch(setCallStatus(getFailureStatus(payload.message || '')))
            dispatch(endCall())
        }

        socket.on('call-answered', handleAnswered)
        socket.on('call-ice-candidate', handleIceCandidate)
        socket.on('call-ended', handleEnded)
        socket.on('call-rejected', handleRejected)
        socket.on('call-error', handleCallError)

        return () => {
            socket.off('call-answered', handleAnswered)
            socket.off('call-ice-candidate', handleIceCandidate)
            socket.off('call-ended', handleEnded)
            socket.off('call-rejected', handleRejected)
            socket.off('call-error', handleCallError)
        }
    }, [socket, dispatch, navigate, activeCall?.callId])

    const handleEnd = () => {
        endingRef.current = true
        callService.endCall({ socket })
        dispatch(setCallStatus('ended'))
        dispatch(endCall())
        navigate('/home/chats', { replace: true })
    }

    const handleToggleMute = () => {
        const enabled = callService.toggleAudio()
        setIsMuted(!enabled)
    }

    const handleToggleCamera = () => {
        const enabled = callService.toggleVideo()
        setIsCameraOff(!enabled)
    }

    const hasRemoteVideo = Boolean(remoteStream?.getVideoTracks().length)

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button type="button" className={styles.backButton} onClick={handleEnd}>
                    End call
                </button>
                <div className={styles.titleBlock}>
                    <span>{callType === 'video' ? 'Video call' : 'Voice call'}</span>
                    <h1>{contactName}</h1>
                </div>
                <div className={styles.statusPill}>
                    {error ||
                        (incomingUnavailable
                            ? 'Incoming call unavailable'
                            : callStatusText[reduxCallStatus] || status)}
                </div>
            </header>

            <main className={styles.stage}>
                {callType === 'video' ? (
                    <div className={styles.videoGrid}>
                        <VideoPreview
                            stream={remoteStream}
                            label={hasRemoteVideo ? contactName : status}
                            name={contactName}
                            connectionState={remoteStream ? 'Live' : undefined}
                        />
                        <div className={styles.localTile}>
                            <VideoPreview
                                stream={localStream}
                                muted
                                label="Your camera"
                                name={user?.displayName || user?.username}
                                isLocal
                                cameraOff={isCameraOff}
                                compact
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.audioStage}>
                        <div className={styles.audioAvatar}>
                            {contactName.charAt(0).toUpperCase()}
                        </div>
                        <span>{status}</span>
                        <h2>{contactName}</h2>
                        <p>
                            {remoteStream
                                ? 'Peer-to-peer voice channel is live.'
                                : 'Waiting for the other person to join.'}
                        </p>
                    </div>
                )}
            </main>

            {(error || incomingUnavailable) && (
                <p className={styles.errorText}>
                    {error || 'This incoming call is no longer available.'}
                </p>
            )}

            <footer className={styles.footer}>
                <CallControls
                    callType={callType}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    onToggleMute={handleToggleMute}
                    onToggleCamera={handleToggleCamera}
                    onEnd={handleEnd}
                />
            </footer>
        </div>
    )
}
