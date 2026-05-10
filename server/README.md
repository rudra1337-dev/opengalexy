# 🌌 OpenGalexy — Backend Server

> *A next-generation chat platform where messages live or die on your terms.*

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4-black)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📖 Table of Contents

1. [Why OpenGalexy?](#-why-opengalexy)
2. [What Makes It Different](#-what-makes-it-different)
3. [Tech Stack](#-tech-stack)
4. [Architecture Overview](#-architecture-overview)
5. [Folder Structure](#-folder-structure)
6. [Database Schema](#-database-schema)
7. [API Reference](#-api-reference)
8. [Socket.io Events](#-socketio-events)
9. [Local Setup Guide](#-local-setup-guide)
10. [Environment Variables](#-environment-variables)
11. [How Key Features Work](#-how-key-features-work)

---

## 💡 Why OpenGalexy?

Most chat apps treat messages as permanent by default — they pile up, create clutter, and raise privacy concerns. OpenGalexy flips this model.

**The core idea is simple:**
> Everything is permanent by default, but users can make anything temporary — a single message, a whole conversation, or even their account — with a single toggle.

This project is being built by a solo founder as a **startup MVP** targeting students, developers, professionals, and general users who want more control over their digital conversations.

**The problems it solves:**
- 🗑️ Chat clutter — temporary rooms auto-delete, no manual cleanup needed
- 🔒 Privacy — burn-after-read messages vanish the moment they're seen
- 📡 Slow file sharing — nearby users on the same network share files peer-to-peer, no upload needed
- 🔗 Friction — anyone can read a public group without signing up; just share a link

---

## ✨ What Makes It Different

| Feature | Traditional Chat Apps | Community Platforms | Secure Messengers | OpenGalexy |
|---|---|---|---|---|
| Temp messages | ❌ | ❌ | ⚠️ Limited | ✅ Full control |
| Burn after read | ❌ | ❌ | ❌ | ✅ |
| Temp accounts | ❌ | ❌ | ❌ | ✅ |
| Public groups (no login) | ❌ | ⚠️ Partial | ❌ | ✅ |
| Nearby file sharing | ❌ | ❌ | ❌ | ✅ WebRTC |
| User-controlled TTL | ❌ | ❌ | ❌ | ✅ Per message |
| Google OAuth only | ❌ | ❌ | ❌ | ✅ No passwords |
| Open invite links | ⚠️ Limited | ✅ | ❌ | ✅ |

Replace that section in your `README.md` with this. It's cleaner — no legal/trademark concerns, no naming competitors directly, and it actually reads better for a startup pitch! 🎯
---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js v20+ | Fast, non-blocking, great ecosystem |
| Framework | Express.js | Minimal, flexible, industry standard |
| Database | MongoDB Atlas | Flexible schema + built-in TTL indexes |
| ODM | Mongoose | Schema validation + TTL index support |
| Real-time | Socket.io | Reliable WebSocket abstraction |
| Auth | Passport.js + Google OAuth 2.0 | No passwords to manage, frictionless login |
| Tokens | JWT (jsonwebtoken) | Stateless, scalable auth |
| Module system | ES Modules (import/export) | Modern JavaScript standard |
| Dev server | Nodemon | Auto-restart on file changes |

---

## 🏗️ Architecture Overview

### Request Flow (REST API)

```
Client (Browser / React App)
        │
        │  HTTP Request
        ▼
┌─────────────────────┐
│      server.js      │  ← Entry point, boots everything
│   (Express + HTTP)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│     Middleware       │
│  ┌───────────────┐  │
│  │ CORS          │  │  ← Allow frontend origin
│  │ JSON Parser   │  │  ← Parse request body
│  │ Cookie Parser │  │  ← Read JWT cookie
│  │ Auth Check    │  │  ← Verify JWT token
│  └───────────────┘  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│       Routes        │  ← /api/auth, /api/rooms, etc.
│  Directs traffic    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│    Controllers      │  ← Business logic lives here
│  Handles the work   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│      Models         │  ← Mongoose schemas
│  Talks to MongoDB   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   MongoDB Atlas     │  ← Stores everything
│  TTL auto-deletes   │  ← Expired docs vanish automatically
└─────────────────────┘
```

### Real-time Flow (Socket.io)

```
Client A                    Server                    Client B
   │                           │                           │
   │── connect ──────────────► │                           │
   │── user-online ──────────► │ ── user-status ─────────► │
   │── join-room ────────────► │ ◄──────────── join-room ──│
   │                           │                           │
   │── send-message ─────────► │ ── message-received ────► │
   │                           │ (also saves to MongoDB)   │
   │                           │                           │
   │── typing ───────────────► │ ── user-typing ──────────►│
   │── stop-typing ──────────► │ ── user-stop-typing ─────►│
   │                           │                           │
   │◄─────────────── message-received ─────────────────────│
```

### Google OAuth Flow

```
User clicks "Continue with Google"
        │
        ▼
GET /api/auth/google
        │
        ▼
Passport redirects → Google Login Page
        │
        ▼
User logs in on Google
        │
        ▼
Google redirects → GET /api/auth/google/callback
        │
        ▼
Passport verifies → finds or creates User in MongoDB
        │
        ├── New user?  → redirect to /onboarding (pick @username)
        │
        └── Existing?  → redirect to /home
        │
        ▼
JWT token set as httpOnly cookie
```

### TTL Auto-Delete Flow

```
User sets message as temp (e.g. 1h)
        │
        ▼
expiresAt = Date.now() + 1 hour → saved in MongoDB
        │
        ▼
MongoDB TTL Index watches expireAfterSeconds: 0
        │
        ▼
When current time > expiresAt → MongoDB deletes document automatically
        │
        ▼
No cron jobs. No cleanup code. Zero maintenance. ✅
```

---

## 📁 Folder Structure

```
opengalexy/
│
├── client/                         ← React frontend (Phase 5)
│
└── server/                         ← Everything backend
    │
    ├── src/
    │   ├── config/
    │   │   ├── db.js               ← MongoDB Atlas connection
    │   │   ├── passport.js         ← Google OAuth strategy (lazy init)
    │   │   └── socket.js           ← All Socket.io events
    │   │
    │   ├── controllers/
    │   │   ├── auth.controller.js  ← Google callback, username, me, logout
    │   │   ├── user.controller.js  ← Search users, get by username
    │   │   ├── room.controller.js  ← Create/get direct rooms, temp toggle
    │   │   ├── message.controller.js
    │   │   │                       ← Send/get messages, mark read, burn
    │   │   ├── group.controller.js ← Create/join/discover groups, admin temp
    │   │   └── nearby.controller.js
    │   │                           ← Nearby share signaling (via Socket.io)
    │   │
    │   ├── models/
    │   │   ├── User.model.js       ← @username, googleId, isTemp, burnAfterRead
    │   │   ├── Room.model.js       ← direct/group type, members, TTL
    │   │   ├── Message.model.js    ← content, isTemp, isBurnAfterRead, TTL
    │   │   └── Group.model.js      ← name, isPublic, inviteCode, members+roles
    │   │
    │   ├── routes/
    │   │   ├── auth.routes.js      ← /api/auth/*
    │   │   ├── user.routes.js      ← /api/users/*
    │   │   ├── room.routes.js      ← /api/rooms/*
    │   │   ├── message.routes.js   ← /api/messages/*
    │   │   ├── group.routes.js     ← /api/groups/*
    │   │   └── nearby.routes.js    ← /api/nearby/*
    │   │
    │   ├── middleware/
    │   │   ├── auth.middleware.js  ← Verify JWT, attach req.user
    │   │   ├── guest.middleware.js ← Allow read-only without login
    │   │   └── error.middleware.js ← Global error handler (always last)
    │   │
    │   ├── utils/
    │   │   ├── generateToken.js    ← Sign JWT (7 day expiry)
    │   │   ├── generateLink.js     ← 12-char unique invite codes
    │   │   └── timeHelper.js       ← Convert '1h'/'24h'/'7d' to Date
    │   │
    │   └── app.js                  ← Main app bootstrap
    │
    ├── .env                        ← Secret keys (never push to GitHub!)
    ├── .env.example                ← Template for others
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── server.js                   ← Entry point: imports ./src/app.js
```

---

## 🗄️ Database Schema

### User Collection

```
┌─────────────────────────────────────────────────┐
│                    users                         │
├─────────────────┬───────────────────────────────┤
│ _id             │ ObjectId (auto)                │
│ username        │ String, unique, 3-20 chars     │ ← @handle
│ displayName     │ String                         │ ← from Google
│ email           │ String, unique                 │ ← from Google
│ googleId        │ String, unique                 │ ← Google account ID
│ avatar          │ String                         │ ← Google profile pic URL
│ usernameSet     │ Boolean, default: false        │ ← false until onboarding
│ isTemp          │ Boolean, default: false        │
│ expiresAt       │ Date | null (TTL Index)        │ ← auto-delete when set
│ defaultMsgMode  │ 'permanent' | 'temp'           │
│ burnAfterRead   │ Boolean, default: false        │
│ isOnline        │ Boolean, default: false        │
│ lastSeen        │ Date                           │
│ createdAt       │ Date (auto)                    │
│ updatedAt       │ Date (auto)                    │
└─────────────────┴───────────────────────────────┘
```

### Room Collection

```
┌─────────────────────────────────────────────────┐
│                    rooms                         │
├─────────────────┬───────────────────────────────┤
│ _id             │ ObjectId (auto)                │
│ type            │ 'direct' | 'group'             │
│ members         │ [ObjectId → User]              │
│ group           │ ObjectId → Group | null        │
│ isTemp          │ Boolean, default: false        │
│ expiresAt       │ Date | null (TTL Index)        │
│ lastMessage     │ { content, sender, sentAt }    │ ← chat list preview
│ createdAt       │ Date (auto)                    │
│ updatedAt       │ Date (auto)                    │
└─────────────────┴───────────────────────────────┘

Indexes:
  - members: 1         (fast lookup by user)
  - type: 1            (filter by direct/group)
  - expiresAt: TTL     (auto-delete)
```

### Message Collection

```
┌─────────────────────────────────────────────────┐
│                   messages                       │
├─────────────────┬───────────────────────────────┤
│ _id             │ ObjectId (auto)                │
│ roomId          │ ObjectId → Room                │
│ sender          │ ObjectId → User                │
│ content         │ String, max 2000 chars         │
│ type            │ 'text' | 'file' | 'image'      │
│ isTemp          │ Boolean, default: false        │
│ expiresAt       │ Date | null (TTL Index)        │ ← auto-delete
│ isBurnAfterRead │ Boolean, default: false        │
│ isBurned        │ Boolean, default: false        │
│ readBy          │ [ObjectId → User]              │
│ fileUrl         │ String | null                  │
│ fileName        │ String | null                  │
│ fileSize        │ Number | null                  │
│ createdAt       │ Date (auto)                    │
│ updatedAt       │ Date (auto)                    │
└─────────────────┴───────────────────────────────┘

Indexes:
  - { roomId: 1, createdAt: -1 }    (fast message fetch per room)
  - expiresAt: TTL                  (auto-delete expired messages)
```

### Group Collection

```
┌─────────────────────────────────────────────────┐
│                    groups                        │
├─────────────────┬───────────────────────────────┤
│ _id             │ ObjectId (auto)                │
│ name            │ String, max 50 chars           │
│ description     │ String, max 200 chars          │
│ avatar          │ String                         │
│ room            │ ObjectId → Room                │ ← linked room
│ createdBy       │ ObjectId → User                │
│ members         │ [{ user, role, joinedAt }]     │
│   └── role      │ 'admin' | 'member'             │
│ isPublic        │ Boolean, default: false        │
│ inviteCode      │ String, unique, 12 chars       │
│ isTemp          │ Boolean, default: false        │
│ expiresAt       │ Date | null (TTL Index)        │
│ createdAt       │ Date (auto)                    │
│ updatedAt       │ Date (auto)                    │
└─────────────────┴───────────────────────────────┘

Indexes:
  - isPublic: 1          (discover public groups)
  - inviteCode: 1        (join by invite code)
  - expiresAt: TTL       (auto-delete temp groups)
```

### Collection Relationships

```
User ──────────────────────────────────────────────┐
  │                                                 │
  │ creates                                         │ member of
  ▼                                                 ▼
Group ──── has one ────► Room ◄──── belongs to ── User
                           │
                           │ contains many
                           ▼
                        Message ──── sent by ────► User
```

---

## 📡 API Reference

All protected routes require a valid JWT token as:
- `Cookie: token=<jwt>` (preferred)
- `Authorization: Bearer <jwt>`

### Auth Routes `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/google` | ❌ | Redirect to Google login |
| GET | `/google/callback` | ❌ | Google callback, sets cookie |
| GET | `/check-username/:username` | ❌ | Check if username is available |
| POST | `/set-username` | ✅ | Set username during onboarding |
| GET | `/me` | ✅ | Get current logged-in user |
| POST | `/logout` | ❌ | Clear JWT cookie |

**Example — Check username:**
```
GET /api/auth/check-username/rudra_dev

Response:
{
  "available": true,
  "username": "rudra_dev"
}
```

**Example — Get current user:**
```
GET /api/auth/me

Response:
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "rudra_dev",
    "displayName": "Rudra",
    "email": "rudra@gmail.com",
    "avatar": "https://...",
    "isOnline": true
  }
}
```

---

### User Routes `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/search?q=username` | ✅ | Search users by username |
| GET | `/:username` | ✅ | Get user profile by @username |

**Example — Search users:**
```
GET /api/users/search?q=rudra

Response:
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "username": "rudra_dev",
      "displayName": "Rudra",
      "avatar": "https://...",
      "isOnline": true,
      "lastSeen": "2026-05-10T..."
    }
  ]
}
```

---

### Room Routes `/api/rooms`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/direct` | ✅ | Get or create direct room with a user |
| GET | `/` | ✅ | Get all rooms for current user |
| GET | `/:id` | ✅ | Get single room by ID |
| PATCH | `/:id/temp` | ✅ | Set room as temporary |

**Example — Start a DM:**
```
POST /api/rooms/direct
Body: { "username": "alex_codes" }

Response:
{
  "success": true,
  "room": {
    "_id": "...",
    "type": "direct",
    "members": [...],
    "isTemp": false,
    "lastMessage": {}
  }
}
```

**Example — Set room as temporary:**
```
PATCH /api/rooms/:id/temp
Body: { "duration": "24h" }

Supported durations: "5m" | "1h" | "24h" | "7d" | "30d"
```

---

### Message Routes `/api/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:roomId` | ✅ | Get messages (paginated) |
| POST | `/:roomId` | ✅ | Send a message |
| PATCH | `/:id/read` | ✅ | Mark as read (burns if burnAfterRead) |

**Example — Send a message:**
```
POST /api/messages/:roomId
Body:
{
  "content": "Hey! Check this out",
  "isTemp": true,
  "duration": "1h",
  "isBurnAfterRead": false,
  "type": "text"
}
```

**Example — Get messages (with pagination):**
```
GET /api/messages/:roomId?page=1&limit=30
```

---

### Group Routes `/api/groups`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/discover` | ❌ | Browse public groups |
| GET | `/mine` | ✅ | Get my groups |
| POST | `/` | ✅ | Create a group |
| POST | `/join/:inviteCode` | ✅ | Join group via invite code |
| PATCH | `/:id/temp` | ✅ Admin only | Set group as temporary |

**Example — Create a group:**
```
POST /api/groups
Body:
{
  "name": "Dev Talk India",
  "description": "Tech discussions for Indian devs",
  "isPublic": true,
  "isTemp": false
}

Response:
{
  "success": true,
  "group": {
    "_id": "...",
    "name": "Dev Talk India",
    "inviteCode": "8e54e7f20bf9",
    "isPublic": true,
    "members": [{ "user": "...", "role": "admin" }]
  }
}
```

**Example — Join via invite:**
```
POST /api/groups/join/8e54e7f20bf9
```

**Example — Set group temp (admin only):**
```
PATCH /api/groups/:id/temp
Body: { "duration": "7d" }

If not admin → 403 Forbidden: "Only group admin can change temp settings"
```

---

## ⚡ Socket.io Events

### Connection

```javascript
// Client connects with auth
const socket = io('http://localhost:5000', {
  withCredentials: true
})

// Tell server who you are
socket.emit('user-online', userId)
```

### Events Reference

| Event (emit) | Payload | Description |
|---|---|---|
| `user-online` | `userId` | Mark user as online |
| `join-room` | `roomId` | Join a chat room |
| `leave-room` | `roomId` | Leave a chat room |
| `send-message` | `{ roomId, content, isTemp, duration, isBurnAfterRead, type }` | Send a message |
| `typing` | `{ roomId, username }` | Start typing indicator |
| `stop-typing` | `{ roomId }` | Stop typing indicator |
| `message-read` | `{ messageId, roomId }` | Mark message as read |
| `call-offer` | `{ to, offer, callType }` | Initiate a call |
| `call-answer` | `{ to, answer }` | Answer a call |
| `call-ice-candidate` | `{ to, candidate }` | WebRTC ICE candidate |
| `call-end` | `{ to }` | End a call |
| `nearby-offer` | `{ to, offer }` | Initiate nearby share |
| `nearby-answer` | `{ to, answer }` | Accept nearby share |
| `nearby-ice-candidate` | `{ to, candidate }` | Nearby share ICE |

| Event (listen) | Payload | Description |
|---|---|---|
| `user-status` | `{ userId, status }` | User came online/offline |
| `message-received` | Message object | New message in room |
| `user-typing` | `{ username }` | Someone is typing |
| `user-stop-typing` | — | Someone stopped typing |
| `message-seen` | `{ messageId, userId }` | Message was read |
| `message-burned` | `{ messageId }` | Burn-after-read triggered |
| `call-incoming` | `{ from, offer, callType }` | Incoming call |
| `call-answered` | `{ answer }` | Call was answered |
| `call-ended` | — | Other person ended call |

---

## 🚀 Local Setup Guide

### Prerequisites

Make sure you have these installed:

```bash
node --version    # v18 or higher
npm --version     # v9 or higher
git --version     # any recent version
```

### Step 1 — Clone the repository

```bash
git clone https://github.com/rudra1337-dev/opengalexy.git
cd opengalexy/server
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs:
- `express` — web framework
- `mongoose` — MongoDB ODM
- `socket.io` — real-time engine
- `passport` + `passport-google-oauth20` — Google auth
- `jsonwebtoken` — JWT tokens
- `bcryptjs` — password hashing utility
- `dotenv` — environment variables
- `cors` — cross-origin requests
- `cookie-parser` — read cookies
- `uuid` — generate unique IDs
- `nodemon` (dev) — auto-restart server

### Step 3 — Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free account
2. Create a new cluster — choose **M0 Free Tier**
3. Set region to **Mumbai (ap-south-1)** for best performance in India
4. Name your cluster `opengalexy`
5. Go to **Database Access** → Add a new user with a password
6. Go to **Network Access** → Add `0.0.0.0/0` (allow all IPs for development)
7. Click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://<username>:<password>@opengalexy.jrntbyk.mongodb.net/?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your DB credentials.

### Step 4 — Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named `opengalexy`
3. Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** → Create
   - App name: `OpenGalexy`
   - Add your email as support email
   - Save & Continue
4. Go to **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
   - Click Create
5. Copy your **Client ID** and **Client Secret**

### Step 5 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@opengalexy.jrntbyk.mongodb.net/opengalexy?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_string_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=http://localhost:5173
```

### Step 6 — Start the development server

```bash
npm run dev
```

You should see:

```
🚀 Server running on port 5000
✅ MongoDB connected: ac-xxxxxxx.mongodb.net
```

### Step 7 — Test the server

```bash
# Health check
curl http://localhost:5000

# Expected output:
{"message":"🌌 OpenGalexy server is live!"}

# Test Google OAuth
# Open in browser → http://localhost:5000/api/auth/google
# Complete Google login → get redirected to localhost:5173/onboarding

# Test your user
curl http://localhost:5000/api/auth/me \
  -b "token=your_jwt_token_from_cookie"

# Search users
curl "http://localhost:5000/api/users/search?q=yourUsername" \
  -b "token=your_jwt_token"

# Browse public groups (no auth needed)
curl http://localhost:5000/api/groups/discover
```

### Step 8 — Start the frontend (when ready)

```bash
cd ../client
npm run dev
# Runs on http://localhost:5173
```

---

## 🌿 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port to run the server on (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens (make it long and random) |
| `GOOGLE_CLIENT_ID` | ✅ | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ | From Google Cloud Console |
| `CLIENT_URL` | ✅ | Frontend URL (http://localhost:5173 for dev) |

> ⚠️ Never commit your `.env` file to GitHub. It's already in `.gitignore`.

---

## 🔬 How Key Features Work

### Temp Messages — MongoDB TTL Index

The magic behind auto-deleting messages is MongoDB's built-in TTL (Time To Live) index.

```javascript
// In Message.model.js
expiresAt: {
  type: Date,
  default: null,
  index: { expireAfterSeconds: 0 }  // ← MongoDB checks this field
}
```

When a user sends a temp message with duration `"1h"`:
1. `timeHelper.js` calculates `expiresAt = now + 1 hour`
2. Message is saved with that `expiresAt` date
3. MongoDB's background thread checks every 60 seconds
4. When `current time > expiresAt`, MongoDB deletes the document automatically
5. No cron jobs, no cleanup code, zero maintenance

### Burn After Read

```
Client opens message
        │
        ▼
socket.emit('message-read', { messageId, roomId })
        │
        ▼
Server: message.readBy.push(userId)
        │
        ├── isBurnAfterRead === true?
        │         │
        │         ▼
        │   message.isBurned = true
        │   message.save()
        │         │
        │         ▼
        │   io.to(roomId).emit('message-burned', { messageId })
        │         │
        │         ▼
        │   All clients in room delete this message from UI
        │
        └── false → just update readBy, emit 'message-seen'
```

### Group Room Relationship

Every group internally owns a Room. Messages belong to the Room, not the Group directly.

```
createGroup() is called
        │
        ▼
1. Create a Room (type: 'group', members: [creator])
        │
        ▼
2. Create Group (links to Room._id)
        │
        ▼
3. Update Room with group._id reference
        │
        ▼
Messages are sent to Room._id
Group._id is used for metadata (name, invite code, members, roles)
```

### Admin-Only Temp Control

```
PATCH /api/groups/:id/temp
        │
        ▼
authMiddleware → is user logged in? → 401 if not
        │
        ▼
setGroupTemp controller:
  find group by id
        │
        ▼
  find user in group.members array
  └── not found → 403 "You are not a member"
        │
        ▼
  check member.role === 'admin'
  └── not admin → 403 "Only group admin can change temp settings"
        │
        ▼
  update group.expiresAt + room.expiresAt
  → both the group and its room expire at the same time ✅
```

---

## 🔐 Security Notes

- JWT tokens are stored in **httpOnly cookies** — cannot be accessed by JavaScript (XSS protection)
- Stack traces are **hidden in production** — only shown in development
- Sensitive fields (`googleId`, `email`) are **excluded from search results** using `.select()`
- All room/message endpoints **verify membership** before returning data
- Group temp toggle is **restricted to admins** only
- `.env` is in `.gitignore` — secrets never touch Git

---

## 📜 Available Scripts

```bash
npm run dev      # Start with nodemon (auto-restart)
npm run start    # Start without nodemon (production)
```

---

## 🗺️ Project Roadmap

```
✅ Phase 1 — Project Setup & Folder Structure
✅ Phase 2 — Google OAuth + JWT Authentication
✅ Phase 3 — REST APIs (Rooms, Messages, Groups)
✅ Phase 4 — Socket.io Real-time Events
⏳ Phase 5 — React Frontend (in progress)
⏳ Phase 6 — Temp Feature UI
⏳ Phase 7 — Nearby File Share (WebRTC)
⏳ Phase 8 — Voice/Video Calls (WebRTC)
⏳ Phase 9 — Deploy (Vercel + Render)
⏳ Phase 10 — AI Chat (user API key)
```

---

## 🤝 Contributing

This is currently a solo founder project. Contributions, suggestions, and feedback are welcome once the MVP is live!

---

## 📄 License

MIT License — feel free to learn from this code.

---

*Built with ❤️ by Rudra · OpenGalexy · 2026*
