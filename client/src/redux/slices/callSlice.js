import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    incomingCall: null,
    acceptedCall: null,
    activeCall: null,
    status: 'idle',
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isCameraOff: false
}

const callSlice = createSlice({
    name: 'call',
    initialState,
    reducers: {
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload
            state.status = action.payload ? 'ringing' : 'idle'
        },
        acceptIncomingCall: (state) => {
            state.acceptedCall = state.incomingCall
            state.incomingCall = null
            state.status = state.acceptedCall ? 'accepting' : 'idle'
        },
        setActiveCall: (state, action) => {
            state.activeCall = action.payload
            if (action.payload) {
                state.incomingCall = null
                state.acceptedCall = null
                state.status = 'connected'
            }
        },
        setCallStatus: (state, action) => {
            state.status = action.payload || 'idle'
        },
        setLocalStream: (state, action) => {
            state.localStream = action.payload
        },
        setRemoteStream: (state, action) => {
            state.remoteStream = action.payload
        },
        toggleMute: (state) => {
            state.isMuted = !state.isMuted
        },
        toggleCamera: (state) => {
            state.isCameraOff = !state.isCameraOff
        },
        endCall: (state) => {
            state.activeCall = null
            state.incomingCall = null
            state.acceptedCall = null
            state.status = 'idle'
            state.localStream = null
            state.remoteStream = null
            state.isMuted = false
            state.isCameraOff = false
        }
    }
})

export const {
    setIncomingCall,
    acceptIncomingCall,
    setActiveCall,
    setCallStatus,
    setLocalStream,
    setRemoteStream,
    toggleMute,
    toggleCamera,
    endCall
} = callSlice.actions

export default callSlice.reducer
