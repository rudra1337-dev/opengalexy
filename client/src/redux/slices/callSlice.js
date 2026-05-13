import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    incomingCall: null,
    activeCall: null,
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
        },
        setActiveCall: (state, action) => {
            state.activeCall = action.payload
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
            state.localStream = null
            state.remoteStream = null
            state.isMuted = false
            state.isCameraOff = false
        }
    }
})

export const {
    setIncomingCall,
    setActiveCall,
    setLocalStream,
    setRemoteStream,
    toggleMute,
    toggleCamera,
    endCall
} = callSlice.actions

export default callSlice.reducer
