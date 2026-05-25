# 🎨 OpenGalexy — Frontend Client

> React + Vite + Redux Toolkit + Tailwind CSS + CSS Modules

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-violet)](https://redux-toolkit.js.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)](https://tailwindcss.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Client-black)](https://socket.io)

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [High Level Design (HLD)](#-high-level-design-hld)
5. [Low Level Design (LLD)](#-low-level-design-lld)
6. [State Management](#-state-management-redux-toolkit)
7. [Styling Strategy](#-styling-strategy)
8. [Routing](#-routing)
9. [Socket.io Integration](#-socketio-integration)
10. [WebRTC — Calls & Nearby Share](#-webrtc--calls--nearby-share)
11. [Theme System](#-theme-system)
12. [Local Setup Guide](#-local-setup-guide)
13. [Environment Variables](#-environment-variables)
14. [Component Reference](#-component-reference)
15. [Pages Reference](#-pages-reference)

---

## 🌟 Overview

This is the frontend client for OpenGalexy — a full-featured chat application with real-time messaging, WebRTC calls, peer-to-peer file sharing, and a unique temp/permanent message control system.

Built as a **Single Page Application (SPA)** using React 18 with Vite as the build tool. State is managed globally via Redux Toolkit. Real-time communication runs via Socket.io. Calls and file sharing use WebRTC.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component library |
| Vite | 5 | Build tool and dev server |
| Redux Toolkit | 2 | Global state management |
| React Redux | 9 | React bindings for Redux |
| React Router DOM | 6 | Client-side routing |
| Axios | 1 | HTTP API calls |
| Socket.io Client | 4 | Real-time WebSocket events |
| Tailwind CSS | 3 | Utility-first styling |
| CSS Modules | (built-in) | Scoped component styles |
| PeerJS | 1 | WebRTC abstraction for calls |

---

## 📁 Folder Structure

```
client/
│
├── public/                         ← Static assets
│   └── favicon.ico
│
├── src/
│   │
│   ├── components/                 ← Reusable UI components
│   │   ├── Auth/
│   │   │   ├── GoogleLoginBtn.jsx        ← Google OAuth button
│   │   │   └── UsernamePickerModal.jsx   ← Onboarding username picker
│   │   │
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx                ← Top navigation bar
│   │   │   ├── BottomNav.jsx             ← Mobile bottom navigation
│   │   │   ├── MainLayout.jsx            ← Sidebar + main panel wrapper
│   │   │   └── ThemeToggle.jsx           ← Light/dark mode toggle button
│   │   │
│   │   ├── Chats/
│   │   │   ├── ChatList.jsx              ← List of all DM conversations
│   │   │   ├── ChatItem.jsx              ← Single chat preview in list
│   │   │   ├── ChatScreen.jsx            ← Active conversation view
│   │   │   ├── ChatHeader.jsx            ← Chat top bar (user info + call buttons)
│   │   │   ├── MessageBubble.jsx         ← Single message bubble (sent/received)
│   │   │   ├── InputBar.jsx              ← Message input + send + temp toggle
│   │   │   └── TempToggle.jsx            ← Standalone temp toggle component
│   │   │
│   │   ├── Groups/
│   │   │   ├── GroupList.jsx             ← My groups + discover tabs
│   │   │   ├── GroupCard.jsx             ← Single group preview card
│   │   │   ├── GroupScreen.jsx           ← Group conversation view
│   │   │   ├── GroupHeader.jsx           ← Group top bar (name + settings)
│   │   │   ├── DiscoverGroups.jsx        ← Browse public groups
│   │   │   └── GroupCreatorModal.jsx     ← Create new group modal
│   │   │
│   │   ├── Calls/
│   │   │   ├── CallScreen.jsx            ← Active call fullscreen UI
│   │   │   ├── CallIncoming.jsx          ← Incoming call notification modal
│   │   │   ├── VideoPreview.jsx          ← Camera preview component
│   │   │   └── CallControls.jsx          ← Mute, camera, end buttons
│   │   │
│   │   ├── NearbyShare/
│   │   │   ├── NearbyScreen.jsx          ← Main nearby share UI + radar
│   │   │   ├── NearbyDeviceList.jsx      ← List of nearby devices
│   │   │   ├── FileSelector.jsx          ← File picker with drag & drop
│   │   │   └── TransferProgress.jsx      ← Transfer progress bars
│   │   │
│   │   └── Profile/
│   │       ├── ProfileCard.jsx           ← User avatar, name, username, stats
│   │       ├── TempControlPanel.jsx      ← Global temp settings toggles
│   │       ├── PrivacySettings.jsx       ← Privacy preference toggles
│   │       └── SettingsPanel.jsx         ← Theme, account, logout settings
│   │
│   ├── pages/                      ← Route-level page components
│   │   ├── Landing.jsx                   ← Home page (not logged in)
│   │   ├── OnboardingPage.jsx            ← @username picker page
│   │   ├── HomePage.jsx                  ← Main app shell with nested routes
│   │   ├── ProfilePage.jsx               ← Full profile page
│   │   ├── CallPage.jsx                  ← Full-screen call page
│   │   └── NotFoundPage.jsx              ← 404 page
│   │
│   ├── redux/                      ← Global state management
│   │   ├── store.js                      ← Redux store config
│   │   └── slices/
│   │       ├── authSlice.js              ← Auth state (user, isAuthenticated)
│   │       ├── chatsSlice.js             ← DMs, active chat, messages
│   │       ├── messagesSlice.js          ← Messages cache
│   │       ├── groupsSlice.js            ← Groups, discovery, active group
│   │       ├── uiSlice.js                ← Modals, loading, notifications
│   │       ├── socketSlice.js            ← Socket connection state
│   │       └── callSlice.js              ← Active call, streams, controls
│   │
│   ├── services/                   ← API and external service calls
│   │   ├── api.js                        ← Axios instance + interceptors
│   │   ├── authService.js                ← Auth API calls
│   │   ├── chatService.js                ← Room + message API calls
│   │   ├── groupService.js               ← Group API calls
│   │   ├── userService.js                ← User search and profile
│   │   ├── socketService.js              ← Socket.io init and connection
│   │   └── callService.js                ← WebRTC call logic (PeerJS)
│   │
│   ├── hooks/                      ← Custom React hooks
│   │   ├── useAuth.js                    ← Access auth state
│   │   ├── useChat.js                    ← Access chat state
│   │   ├── useSocket.js                  ← Access socket instance
│   │   ├── useMessages.js                ← Message CRUD
│   │   ├── useGroups.js                  ← Group operations
│   │   ├── useCall.js                    ← Call state and actions
│   │   └── useNearby.js                  ← Nearby share state
│   │
│   ├── context/                    ← React Context providers
│   │   └── ThemeContext.jsx              ← Light/dark theme provider
│   │
│   ├── utils/                      ← Helper functions
│   │   ├── constants.js                  ← API URLs, app constants
│   │   ├── formatters.js                 ← Date, time, size formatters
│   │   ├── validators.js                 ← Username, message validators
│   │   └── localStorage.js              ← LocalStorage helpers
│   │
│   ├── styles/                     ← CSS Module files (mirrors components/)
│   │   ├── globals.css                   ← Global animations and utilities
│   │   ├── theme.css                     ← CSS variables for light/dark theme
│   │   ├── Auth/
│   │   │   ├── GoogleLoginBtn.module.css
│   │   │   └── UsernamePickerModal.module.css
│   │   ├── Layout/
│   │   │   ├── Navbar.module.css
│   │   │   ├── BottomNav.module.css
│   │   │   ├── MainLayout.module.css
│   │   │   └── ThemeToggle.module.css
│   │   ├── Chats/
│   │   │   ├── ChatList.module.css
│   │   │   ├── ChatItem.module.css
│   │   │   ├── ChatScreen.module.css
│   │   │   ├── MessageBubble.module.css
│   │   │   ├── InputBar.module.css
│   │   │   └── ChatHeader.module.css
│   │   ├── Groups/
│   │   │   ├── GroupList.module.css
│   │   │   ├── GroupCard.module.css
│   │   │   ├── GroupScreen.module.css
│   │   │   ├── GroupHeader.module.css
│   │   │   ├── DiscoverGroups.module.css
│   │   │   └── GroupCreatorModal.module.css
│   │   ├── Calls/
│   │   │   ├── CallScreen.module.css
│   │   │   ├── CallIncoming.module.css
│   │   │   ├── VideoPreview.module.css
│   │   │   └── CallControls.module.css
│   │   ├── NearbyShare/
│   │   │   ├── NearbyScreen.module.css
│   │   │   ├── NearbyDeviceList.module.css
│   │   │   ├── FileSelector.module.css
│   │   │   └── TransferProgress.module.css
│   │   └── Profile/
│   │       ├── ProfileCard.module.css
│   │       ├── TempControlPanel.module.css
│   │       ├── PrivacySettings.module.css
│   │       └── SettingsPanel.module.css
│   │
│   ├── App.jsx                     ← Root component + routing + auth check
│   ├── main.jsx                    ← Entry point (ReactDOM.render)
│   └── index.css                   ← Tailwind directives + global resets
│
├── .env                            ← Environment variables (never commit!)
├── .env.example                    ← Template for .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🏗️ High Level Design (HLD)

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │   React SPA     │    │   Redux Store     │                   │
│  │   (Vite)        │◄──►│   (Global State)  │                   │
│  └────────┬────────┘    └──────────────────┘                   │
│           │                                                     │
│    ┌──────┴──────────────────────────┐                         │
│    │                                 │                         │
│    ▼                                 ▼                         │
│  REST API (Axios)            Socket.io Client                  │
│  HTTP Requests               WebSocket Events                  │
│    │                                 │                         │
└────┼─────────────────────────────────┼─────────────────────────┘
     │                                 │
     ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenGalexy Backend                         │
│                   (Node.js + Express.js)                        │
│                                                                 │
│   REST API Routes          Socket.io Server                    │
│   /api/auth/*              real-time events                    │
│   /api/rooms/*             messaging                           │
│   /api/messages/*          presence                            │
│   /api/groups/*            calls                               │
│   /api/users/*             nearby share                        │
│                                                                 │
│                      MongoDB Atlas                              │
│                   (TTL auto-deletion)                           │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
  WebRTC (P2P)
  Calls + Nearby Share
  (direct between browsers,
   server only does signaling)
```

### User Journey Map

```
New User                          Returning User
   │                                    │
   ▼                                    ▼
Landing Page                    App loads → /api/auth/me
   │                                    │
   ▼                                    ▼
Click Google Login              JWT valid? → /home/chats
   │                            JWT invalid? → Landing
   ▼
Google OAuth (redirect)
   │
   ▼
Backend creates user
Sets JWT cookie
   │
   ├── New user? → /onboarding (pick @username)
   │                    │
   │                    ▼
   │             Username saved → /home/chats
   │
   └── Existing? → /home/chats
                        │
                        ▼
                   Socket connects
                   User goes online
                   Load chat list
```

### Data Flow — Sending a Message

```
User types in InputBar
        │
        ▼
Clicks send / presses Enter
        │
        ▼
Optimistic Update:
dispatch(addMessage(tempMsg))    ← shows immediately
        │
        ▼
socket.emit('send-message', {
  roomId, content, isTemp, duration
})
        │
        ▼
Backend saves to MongoDB
Emits to all room members
        │
        ▼
socket.on('message-received', msg)
dispatch(addMessage(realMsg))    ← updates with server data
        │
        ▼
Component re-renders ✅
```

---

## 🔬 Low Level Design (LLD)

### Component Architecture

```
<App>
  ├── Auth check on mount (GET /api/auth/me)
  ├── Socket init when authenticated
  │
  ├── <Landing />              path="/"
  ├── <OnboardingPage />       path="/onboarding"
  │
  └── <HomePage />             path="/home/*" (Protected)
      │
      ├── <MainLayout>
      │   ├── <Navbar />
      │   ├── Sidebar (left panel)
      │   ├── Main (right panel)
      │   └── <BottomNav />  (mobile only)
      │
      ├── /home/chats
      │   ├── Sidebar: <ChatList />
      │   │   └── <ChatItem /> × many
      │   └── Main: <ChatScreen />
      │       ├── <ChatHeader />
      │       ├── <MessageBubble /> × many
      │       └── <InputBar />
      │
      ├── /home/groups
      │   ├── Sidebar: <GroupList />
      │   │   ├── <GroupCard /> × many
      │   │   ├── <DiscoverGroups />
      │   │   └── <GroupCreatorModal />
      │   └── Main: <GroupScreen />
      │       ├── <GroupHeader />
      │       ├── <MessageBubble /> × many
      │       └── <InputBar />
      │
      ├── /home/nearby
      │   └── <NearbyScreen />
      │       ├── <FileSelector />
      │       ├── <NearbyDeviceList />
      │       └── <TransferProgress />
      │
      └── /home/profile
          └── <ProfilePage />
              ├── <ProfileCard />
              ├── <TempControlPanel />
              ├── <PrivacySettings />
              └── <SettingsPanel />
```

### Redux State Shape

```javascript
{
  auth: {
    user: {
      _id, username, displayName, email,
      avatar, usernameSet, isTemp, expiresAt,
      defaultMessageMode, burnAfterRead,
      isOnline, lastSeen
    } | null,
    isAuthenticated: Boolean,
    isLoading: Boolean,
    error: String | null,
    usernameSet: Boolean
  },

  chats: {
    chatList: [Room],
    activeChat: Room | null,
    activeMessages: [Message],
    isLoadingMessages: Boolean,
    error: String | null,
    unreadCounts: { roomId: Number }
  },

  messages: {
    cache: {
      "roomId": [Message]
    }
  },

  groups: {
    myGroups: [Group],
    publicGroups: [Group],
    activeGroup: Group | null,
    activeGroupMessages: [Message],
    isLoading: Boolean,
    error: String | null
  },

  ui: {
    modals: {
      usernamePickerOpen: Boolean,
      createGroupOpen: Boolean,
      groupSettingsOpen: Boolean,
      userProfileOpen: Boolean,
      userSearchOpen: Boolean
    },
    loading: {
      fetchingChats: Boolean,
      sendingMessage: Boolean,
      creatingGroup: Boolean,
      joiningGroup: Boolean
    },
    notifications: [{ id, message, type }]
  },

  socket: {
    socket: SocketInstance | null,
    isConnected: Boolean,
    connectionError: String | null
  },

  call: {
    incomingCall: { from, callType } | null,
    activeCall: { with, callType, startTime } | null,
    localStream: MediaStream | null,
    remoteStream: MediaStream | null,
    isMuted: Boolean,
    isCameraOff: Boolean
  }
}
```

### Service Layer Design

```
Component
   │
   ▼
Service (e.g. chatService.sendMessage())
   │
   ▼
api.js (Axios instance)
   │
   ├── Sets baseURL from VITE_API_BASE_URL
   ├── Sends cookies (withCredentials: true)
   └── 401 interceptor → redirect to /
   │
   ▼
Backend REST API
```

### Socket Event Architecture

```
Client → Server:
  user-online       userId
  join-room         roomId
  leave-room        roomId
  send-message      { roomId, content, isTemp, duration, type }
  typing            { roomId, username }
  stop-typing       { roomId }
  message-read      { messageId, roomId }
  call-offer        { to, offer, callType }
  call-answer       { to, answer }
  call-ice-candidate { to, candidate }
  call-end          { to }
  nearby-announce   { userId, username }
  nearby-offer      { to, offer }
  nearby-answer     { to, answer }
  nearby-ice-candidate { to, candidate }

Server → Client:
  user-status        { userId, status }
  message-received   Message
  user-typing        { username }
  user-stop-typing   {}
  message-seen       { messageId, userId }
  message-burned     { messageId }
  call-incoming      { from, offer, callType }
  call-answered      { answer }
  call-ended         {}
  nearby-user-joined { userId, username }
  nearby-user-left   { userId }
  nearby-offer       { from, offer }
  nearby-answer      { answer }
  nearby-ice-candidate { candidate }
```

### WebRTC — Nearby Share Flow

```
User A selects file
User A clicks "Send" to User B
         │
         ▼
A: createPeerConnection(B)
A: createDataChannel('fileTransfer')
A: createOffer()
A: socket.emit('nearby-offer', { to: B, offer })
         │
         ▼
B: socket.on('nearby-offer')
B: createPeerConnection(A)
B: setRemoteDescription(offer)
B: createAnswer()
B: socket.emit('nearby-answer', { to: A, answer })
         │
         ▼
A: socket.on('nearby-answer')
A: setRemoteDescription(answer)
         │
ICE candidates exchanged via socket
         │
         ▼
DataChannel opens (P2P established!)
         │
         ▼
A: sends file metadata as JSON
A: sends file as ArrayBuffer chunks (16KB each)
         │
         ▼
B: receives metadata → knows file name + size
B: receives chunks → tracks progress
B: all chunks received → reconstructs Blob
B: triggers download automatically ✅
```

### WebRTC — Call Flow

```
Caller clicks 📞 or 📹
         │
         ▼
getUserMedia() → get local stream
         │
         ▼
createPeerConnection()
addTrack(localStream)
createOffer()
         │
         ▼
socket.emit('call-offer', { to, offer, callType })
         │
         ▼
Receiver: socket.on('call-incoming')
dispatch(setIncomingCall({ from, callType }))
<CallIncoming /> modal shows
         │
         ▼
Receiver accepts:
getUserMedia() → get local stream
createPeerConnection()
setRemoteDescription(offer)
createAnswer()
socket.emit('call-answer', { to, answer })
         │
         ▼
Caller: socket.on('call-answered')
setRemoteDescription(answer)
         │
ICE candidates exchanged via socket
         │
         ▼
P2P connection established!
Streams flowing both ways ✅
<CallScreen /> shows for both
```

---

## 🗃️ State Management (Redux Toolkit)

### Why Redux Toolkit?

Redux Toolkit (RTK) simplifies Redux with:
- `createSlice` — combines actions + reducers
- Built-in Immer — write "mutating" code safely
- DevTools support — inspect state in browser

### Slice Pattern

```javascript
// Every slice follows this pattern
const someSlice = createSlice({
  name: 'feature',
  initialState: { ... },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload    // Immer handles immutability
    }
  }
})

export const { setData } = someSlice.actions
export default someSlice.reducer
```

### Using State in Components

```javascript
// Reading state
const { user } = useSelector(state => state.auth)

// Dispatching actions
const dispatch = useDispatch()
dispatch(setUser(userData))
```

---

## 🎨 Styling Strategy

### Hybrid Approach

```
Tailwind CSS → layout utilities (flex, grid, padding, margin, etc.)
CSS Modules  → custom styles (animations, gradients, theme variables)
```

### Rule of thumb

```jsx
// Layout → Tailwind
<div className="flex items-center gap-3 p-4 rounded-xl">

// Custom styles → CSS Module
<div className={`${styles.card} flex items-center gap-3 p-4 rounded-xl`}>
```

### CSS Module Pattern

```css
/* styles/Feature/Component.module.css */
.card {
  background-color: var(--bg-primary);      /* theme variable */
  border: 1px solid var(--border-color);
  transition: var(--transition);
  animation: slideUp 0.3s ease-out;         /* custom animation */
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### Theme Variables

All colors use CSS variables defined in `src/styles/theme.css`:

```css
/* Light theme (default) */
--bg-primary      → white background
--bg-secondary    → light gray
--bg-tertiary     → slightly darker gray
--text-primary    → dark text
--text-secondary  → medium gray text
--text-tertiary   → light gray text
--border-color    → border lines
--accent-primary  → #3b82f6 (blue)
--success-color   → #10b981 (green)
--error-color     → #ef4444 (red)
--warning-color   → #f59e0b (amber)

/* Dark theme — applied via [data-theme="dark"] */
All variables change to dark equivalents
```

---

## 🛣️ Routing

React Router v6 with nested routes.

```
/                   Landing page (public)
/onboarding         @username picker (semi-protected)

/home               Protected (redirects to /home/chats)
/home/chats         Chat list + active chat
/home/groups        Group list + active group
/home/nearby        Nearby share
/home/profile       User profile + settings

/call/:roomId       Full-screen call page (protected)

/404                Not found page
*                   Redirects to /404
```

### Protected Route Logic

```
Visit /home/chats
       │
       ▼
ProtectedRoute checks:
  isAuthenticated? No  → redirect to /
  isAuthenticated? Yes →
    usernameSet? No  → redirect to /onboarding
    usernameSet? Yes → render children ✅
```

---

## ⚡ Socket.io Integration

### Connection Lifecycle

```
App mounts
  → GET /api/auth/me
  → user found → isAuthenticated = true
  → initSocket(user._id) called
  → socket connects to backend
  → socket.emit('user-online', userId)
  → backend marks user online
  → all listeners set up

User navigates to a chat
  → socket.emit('join-room', roomId)
  → backend: socket.join(roomId)
  → messages from this room now arrive

User closes browser
  → socket disconnects
  → backend marks user offline
  → broadcasts 'user-status: offline' to others
```

### Adding New Events

```javascript
// 1. Add handler in socketService.js or component
socket.on('new-event', (data) => {
  dispatch(someAction(data))
})

// 2. Emit from component
socket.emit('new-event', { payload })

// 3. Clean up in useEffect
return () => {
  socket.off('new-event')
}
```

---

## 📞 WebRTC — Calls & Nearby Share

Both features use WebRTC for peer-to-peer connections.
Socket.io is used only for **signaling** (exchanging connection info).
Actual data flows directly between browsers.

### Calls — via PeerJS

```javascript
import Peer from 'peerjs'

const peer = new Peer(userId)  // unique peer ID = user ID

// Call someone
const call = peer.call(peerId, localStream)

// Receive call
peer.on('call', (call) => {
  call.answer(localStream)
  call.on('stream', (remoteStream) => {
    // show remote video
  })
})
```

### Nearby Share — via Raw WebRTC

```javascript
// Sender
const pc = new RTCPeerConnection({ iceServers })
const channel = pc.createDataChannel('file')
channel.onopen = () => {
  channel.send(fileMetadata)      // JSON string
  channel.send(fileArrayBuffer)   // binary data
}

// Receiver
pc.ondatachannel = ({ channel }) => {
  channel.onmessage = ({ data }) => {
    // reassemble file chunks
  }
}
```

---

## 🌙 Theme System

### Light (Default) / Dark Mode

OpenGalexy defaults to **light theme**. Dark mode is toggled manually or persists from localStorage.

### ThemeContext Usage

```jsx
import { useTheme } from '../context/ThemeContext'

function MyComponent() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
```

### How Theme Applies

```
toggleTheme() called
       │
       ▼
isDark state toggles
       │
       ▼
document.documentElement.setAttribute('data-theme', 'dark')
       │
       ▼
CSS: [data-theme="dark"] { --bg-primary: #0f172a; ... }
       │
       ▼
All components using var(--bg-primary) update automatically ✅
       │
       ▼
localStorage.setItem('theme', 'dark')   ← persists on refresh
```

---

## 🚀 Local Setup Guide

### Prerequisites

```bash
node --version    # v18 or higher
npm --version     # v9 or higher
git --version
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/opengalexy.git
cd opengalexy/client
```

### Step 2 — Install Dependencies

```bash
npm install
```

This installs all packages in `package.json`:
- `react`, `react-dom` — UI
- `react-router-dom` — routing
- `@reduxjs/toolkit`, `react-redux` — state
- `axios` — HTTP calls
- `socket.io-client` — real-time
- `tailwindcss`, `postcss`, `autoprefixer` — styling

### Step 3 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> ⚠️ Must prefix with `VITE_` — otherwise Vite won't expose them to the browser.

### Step 4 — Start the Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

> Make sure the backend is also running on `http://localhost:5000` before using the app.

### Step 5 — Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Deploy this to Vercel or any static host.

### Step 6 — Preview Production Build Locally

```bash
npm run preview
```

---

## 🌿 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | ✅ | Backend WebSocket URL (e.g. `http://localhost:5000`) |

For production:

```env
VITE_API_BASE_URL=https://api.opengalexy.app/api
VITE_SOCKET_URL=https://api.opengalexy.app
```

---

## 📦 Component Reference

### Auth Components

| Component | Props | Description |
|---|---|---|
| `GoogleLoginBtn` | — | Renders Google OAuth button + guest link |
| `UsernamePickerModal` | — | Full-screen onboarding modal with live username check |

### Layout Components

| Component | Props | Description |
|---|---|---|
| `Navbar` | `onMenuClick` | Top navigation bar with logo, theme toggle, user avatar |
| `BottomNav` | — | Mobile-only bottom tab bar (hidden on desktop) |
| `MainLayout` | `sidebar`, `main` | Two-panel layout wrapper |
| `ThemeToggle` | — | Moon/sun icon button to switch theme |

### Chat Components

| Component | Props | Description |
|---|---|---|
| `ChatList` | `onSelectChat` | List of all DM rooms with search |
| `ChatItem` | `chat`, `isActive`, `onClick` | Single chat preview row |
| `ChatScreen` | `onCall` | Full chat conversation view |
| `ChatHeader` | `chat`, `onCall` | Chat top bar with user info and call buttons |
| `MessageBubble` | `message`, `isSent` | Single message with temp timer and read receipt |
| `InputBar` | `onSendMessage`, `onTyping`, `isLoading` | Input with temp toggle and send button |

### Group Components

| Component | Props | Description |
|---|---|---|
| `GroupList` | `onSelectGroup` | My groups + discover tabs with create button |
| `GroupCard` | `group`, `isActive`, `onClick`, `onJoin`, `isPublicView` | Group preview with badges |
| `GroupScreen` | `onSettings` | Group conversation with guest banner |
| `GroupHeader` | `group`, `onSettings`, `onSearch` | Group top bar |
| `DiscoverGroups` | `onJoinGroup` | Searchable public group cards |
| `GroupCreatorModal` | `onClose` | Create group form with toggles |

### Nearby Components

| Component | Props | Description |
|---|---|---|
| `NearbyScreen` | — | Main screen with radar + file selector + devices |
| `NearbyDeviceList` | `devices`, `selectedFile`, `onSendToDevice` | List of discovered peers |
| `FileSelector` | `selectedFile`, `onFileSelect`, `onClear` | Drag & drop file picker |
| `TransferProgress` | `transfers` | Active transfer progress bars |

### Profile Components

| Component | Props | Description |
|---|---|---|
| `ProfileCard` | — | Avatar, display name, username, stats |
| `TempControlPanel` | — | Burn after read, default temp, account temp toggles |
| `PrivacySettings` | — | Online status, last seen, DM, search toggles |
| `SettingsPanel` | — | Theme, email, notifications, logout |

---

## 📄 Pages Reference

| Page | Path | Auth | Description |
|---|---|---|---|
| `Landing` | `/` | ❌ | Landing with Google login + features overview |
| `OnboardingPage` | `/onboarding` | ⚠️ | Username picker for new users |
| `HomePage` | `/home/*` | ✅ | Main app shell with nested routes |
| `ProfilePage` | `/home/profile` | ✅ | Full profile and settings |
| `CallPage` | `/call/:roomId` | ✅ | Full-screen call view |
| `NotFoundPage` | `/404` | ❌ | 404 error page |

---

## 🔍 Available Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production (output: dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## 🔐 Security Notes

- JWT stored in **httpOnly cookie** — not accessible via JavaScript
- All API calls use `withCredentials: true` to send cookies
- 401 responses automatically redirect to landing page
- Environment variables prefixed with `VITE_` — exposed to browser intentionally
- Never put secrets in `.env` on the frontend — everything is visible to users

---

## 🗺️ Development Roadmap

```
✅ Foundation (Auth, Redux, Routing, Theme)
✅ Chat (1-on-1 messaging, real-time)
✅ Groups (create, join, discover, group chat)
✅ Profile (settings, temp controls, privacy)
✅ Nearby Share (WebRTC file transfer)
🔄 Calls (WebRTC voice + video)
⏳ Polish & Responsiveness fixes
⏳ Error boundaries and loading states
⏳ PWA support
⏳ AI Chat (Phase 2)
```

---

*Part of the OpenGalexy project — [Main README](../README.md) | [Backend README](../server/README.md)*

*Built with ❤️ by Rudra · OpenGalexy · 2026*
