# 🌌 OpenGalexy

> **Chat your way. Temp or forever.**
> *Messages that live or die on your terms.*

<div align="center">

![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![Version](https://img.shields.io/badge/Version-0.1.0--alpha-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-MERN-brightgreen)
![Made with](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red)

</div>

---

> ⚠️ **UNDER ACTIVE DEVELOPMENT**
> OpenGalexy is currently in early alpha. Features are incomplete, APIs may change, and things may break. Not recommended for production use yet. Star the repo to follow progress! ⭐

---

## 🌍 What is OpenGalexy?

OpenGalexy is an **open, next-generation chat platform** built for people who want full control over their conversations. Unlike traditional chat apps where everything is permanent by default, OpenGalexy lets users decide the lifespan of every message, chat, or group — from a 5-minute burst to forever.

Think of it as the intersection of **privacy, simplicity, and community** — where you control what stays and what disappears.

---

## 💡 The Problem We're Solving

Every major chat platform today has the same problem:

- 🗑️ **Chat clutter** — Messages pile up with no way to auto-clean
- 🔒 **No real privacy** — Everything is stored permanently on servers
- 📁 **Slow file sharing** — Files go through servers even when two people sit next to each other
- 🔗 **Too much friction** — You need an account just to read a public group
- 🤖 **No AI integration** — Bringing your own AI to a conversation isn't possible

OpenGalexy solves all of these in one platform.

---

## ✨ Our Solution

A full-featured chat platform where:

| Problem | OpenGalexy Solution |
|---|---|
| Message clutter | TTL-based auto-deletion at database level |
| Privacy concerns | Burn-after-read, temp accounts, user-controlled TTL |
| Slow file sharing | WebRTC peer-to-peer nearby file transfer |
| Login friction | Public groups readable without any account |
| No AI support | Bring your own API key for AI chat (Phase 2) |

---

## 🎯 Mission

> *Empower every person to communicate on their own terms — with full control over what they share, how long it lasts, and who sees it.*

---

## 🔭 Vision

To become the **go-to open communication platform** that respects user privacy, reduces digital clutter, and brings communities together — without the noise.

We envision a world where:
- Students can create temporary study groups that vanish after exams
- Developers can spin up ephemeral team channels for a sprint
- Anyone can share files instantly with the person sitting next to them
- Communities can grow publicly without forcing newcomers to register
- Everyone can chat with or without an AI — on their own terms

---

## 👥 Who Is This For?

OpenGalexy is designed for **everyone** but particularly resonates with:

**🎓 Students**
Create temp study groups, share notes via Nearby Share, auto-delete exam chats

**💻 Developers**
Public dev communities, ephemeral project channels, AI-assisted coding chat

**👔 Professionals**
Temporary project rooms that vanish after delivery, no clutter left behind

**🌐 Communities**
Public groups where anyone can read without signing up — lower barrier to entry

**🔐 Privacy-conscious users**
Burn-after-read messages, temp accounts, no permanent trace

---

## 🚀 Core Features

### Available in MVP
- 🔐 **Google OAuth** — No passwords. Sign in with Google, get a unique `@username`
- 💬 **1-on-1 Chat** — Direct messaging via `@username`
- 👥 **Groups** — Public and private groups with invite links
- 🌡️ **Temp Control** — Toggle any message, chat, or group as temporary
- ⏱️ **TTL Auto-Delete** — MongoDB deletes expired content automatically
- 🔥 **Burn After Read** — Messages self-destruct the moment they're read
- 📡 **Nearby Share** — WebRTC peer-to-peer file sharing over same WiFi
- 📞 **Voice & Video Calls** — WebRTC powered, works in the browser
- 🌐 **Guest Read Access** — Public groups readable without any account
- 🔍 **Search** — Search across chats, groups, and nearby

### Coming in Phase 2
- 🤖 **AI Chat** — Bring your own API key (OpenAI, Anthropic, etc.)
- 📱 **Progressive Web App** — Install like a native app
- 🔔 **Push Notifications**
- 📊 **Group Analytics** for admins
- 🌍 **Multiple Languages**

---

## 🏗️ How It's Different

| Feature | Traditional Chat Apps | Community Platforms | Secure Messengers | OpenGalexy |
|---|---|---|---|---|
| Temp messages | ❌ | ❌ | ⚠️ Limited | ✅ Full control |
| Burn after read | ❌ | ❌ | ❌ | ✅ |
| Temp accounts | ❌ | ❌ | ❌ | ✅ |
| Public groups (no login) | ❌ | ⚠️ Partial | ❌ | ✅ |
| Nearby file sharing | ❌ | ❌ | ❌ | ✅ WebRTC |
| User-controlled TTL | ❌ | ❌ | ❌ | ✅ Per message |
| Google OAuth only | ❌ | ❌ | ❌ | ✅ No passwords |
| Open invite links | ⚠️ | ✅ | ❌ | ✅ |

---

## 🛠️ Tech Stack

```
Frontend          React + Vite + Redux Toolkit + Tailwind CSS + CSS Modules
Backend           Node.js + Express.js
Database          MongoDB Atlas (TTL Indexes for auto-deletion)
Real-time         Socket.io (WebSocket)
Calls & Share     WebRTC (PeerJS)
Auth              Google OAuth 2.0 + JWT
Deployment        Vercel (Frontend) + Render (Backend)
```

---

## 📁 Repository Structure

```
opengalexy/
│
├── client/          ← React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── README.md    ← Full frontend docs
│
├── server/          ← Node.js backend (Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── README.md    ← Full backend docs
│
└── README.md        ← You are here
```

---

## ⚡ Quick Start

### Prerequisites
```bash
node --version    # v18+
npm --version     # v9+
git --version
```

### Clone & Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/opengalexy.git
cd opengalexy

# Setup backend
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev

# Setup frontend (new terminal)
cd ../client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` 🚀

For full setup instructions see:
- 📖 [Backend README](./server/README.md)
- 📖 [Frontend README](./client/README.md)

---

## 🗺️ Development Roadmap

```
Phase 1 — MVP (In Progress)
  ✅ Project Setup & Architecture
  ✅ Google OAuth + JWT Authentication
  ✅ REST APIs (Rooms, Messages, Groups)
  ✅ Socket.io Real-time Messaging
  ✅ React Frontend Foundation
  ✅ Chat (1-on-1 + Groups)
  ✅ Temp/Permanent Toggle
  ✅ Nearby Share (WebRTC)
  🔄 Voice/Video Calls (WebRTC)
  ⏳ Polish & Bug Fixes
  ⏳ Deploy to Production

Phase 2 — Growth
  ⏳ AI Chat (BYOK — Bring Your Own Key)
  ⏳ Progressive Web App (PWA)
  ⏳ Push Notifications
  ⏳ File preview in chat
  ⏳ Message reactions
  ⏳ Group analytics for admins

Phase 3 — Scale
  ⏳ Mobile app (React Native)
  ⏳ Multi-language support
  ⏳ End-to-end encryption
  ⏳ Custom domains for groups
  ⏳ API access for developers
```

---

## 🤝 Contributing

OpenGalexy is being built in public. Once MVP is stable, contributions will be welcome!

For now you can:
- ⭐ Star the repo to show support
- 🐛 Open issues for bugs
- 💡 Suggest features via issues
- 📖 Improve documentation

---

## 👨‍💻 Built By

**Rudra** — Solo founder, BTech CSE student from Bhubaneswar, Odisha, India.

Building OpenGalexy as a real-world startup project to solve genuine communication problems while learning full-stack development.

Follow the build journey → [YouTube: @ExploreTechOfficiall](https://youtube.com/@ExploreTechOfficiall)

---

## 📄 License

MIT License — Free to use, learn from, and build upon.

---

<div align="center">

*Built with ❤️ from Bhubaneswar, India*

**🌌 OpenGalexy — Chat your way. Temp or forever.**

</div>
