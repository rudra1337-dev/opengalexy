import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import passport from 'passport'

import connectDB from './config/db.js'
import { initSocket } from './config/socket.js'
import initPassport from './config/passport.js'  // ← import the function

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import roomRoutes from './routes/room.routes.js'
import messageRoutes from './routes/message.routes.js'
import groupRoutes from './routes/group.routes.js'
import nearbyRoutes from './routes/nearby.routes.js'

import errorMiddleware from './middleware/error.middleware.js'

dotenv.config()  // ← env loads first

initPassport()   // ← now passport reads env safely ✅

const app = express()
const server = http.createServer(app)

connectDB()
initSocket(server)

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/nearby', nearbyRoutes)

app.get('/', (req, res) => res.json({ message: '🌌 OpenGalexy server is live!' }))

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))