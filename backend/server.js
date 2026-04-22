import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import chatRouter from './routes/chatRoute.js'
import callRouter from './routes/callRoute.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import messageModel from './models/messageModel.js'
import callModel from './models/callModel.js'

const app = express()
const port = process.env.PORT || 4000

// allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)


// security middleware
app.use(helmet())

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true
}))


// rate limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min.
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many auth attempts, please try again later.' }
})


app.use(globalLimiter)
app.use(express.json({ limit: '10mb' }))



// http server and Socket.io
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials:true
    }
})


// DB and Cloud
connectDB()
connectCloudinary()


// Routes
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/chat', chatRouter)
app.use('/api/calls', callRouter)

app.get('/', (_req, res) => res.send(' DocNest API running'))

// 404 
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message)
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' })
})

// Socket.io — call signalling
io.on('connection', (socket) => {
    console.log('[Socket] Connected:', socket.id)

    //join-room
    socket.on('join-room', (roomId) => {
        socket.join(roomId)
        const size = io.sockets.adapter.rooms.get(roomId)?.size ?? 0
        console.log(`[join-room] ${socket.id} → ${roomId} | members: ${size}`)
    })

    // call-user 
    socket.on('call-user', async (data) => {
        const { roomId } = data
        try {
            //  update call record
            const existing = await callModel.findOne({ roomId })
            if (!existing) {
                await callModel.create({
                    roomId,
                    callerId: data.callerId,
                    callerModel: data.callerModel,
                    receiverId: data.receiverId,
                    receiverModel: data.receiverModel,
                    callType: data.callType,
                    status: 'ringing'
                })
            } else {
                await callModel.findOneAndUpdate(
                    { roomId },
                    { status: 'ringing', endedAt: null, startedAt: null }
                )
            }

            

            socket.to(roomId).emit('incoming-call', {
                roomId,
                callerName: data.callerName,
                callerImage: data.callerImage,
                callType: data.callType,
                callerId: data.callerId
            })

        } catch (err) {
            console.error('[call-user] error:', err.message)
        }
    })

    // call-accepted 
    socket.on('call-accepted', async ({ roomId }) => {
        try {
            await callModel.findOneAndUpdate(
                { roomId },
                { status: 'accepted', startedAt: new Date() }
            )
            socket.to(roomId).emit('call-accepted', { roomId })
        } catch (err) {
            console.error('[call-accepted] error:', err.message)
        }
    })

    // call-rejected 
    socket.on('call-rejected', async ({ roomId }) => {
        try {
            await callModel.findOneAndUpdate({ roomId }, { status: 'rejected' })
            socket.to(roomId).emit('call-rejected', { roomId })
        } catch (err) {
            console.error('[call-rejected] error:', err.message)
        }
    })

    //  call-ended
    socket.on('call-ended', async ({ roomId }) => {
        try {
            const call = await callModel.findOne({ roomId })
            if (call) {
                call.status = 'ended'
                call.endedAt = new Date()
                await call.save()
            }
            socket.to(roomId).emit('call-ended', { roomId })
        } catch (err) {
            console.error('[call-ended] error:', err.message)
        }
    })

    //  WebRTC signalling 
    socket.on('signal', ({ roomId, signalData }) => {
        socket.to(roomId).emit('signal', { signalData })
    })

    // Chat
    socket.on('send-message', async (data) => {
        try {
            const saved = await messageModel.create({
                roomId: data.roomId,
                sender: data.sender,
                senderType: data.senderType,
                name: data.name,
                message: data.message,
                imageUrl: data.imageUrl || null,
                isRead: false,
                readAt: null,
                time: new Date()
            })
            io.to(data.roomId).emit('receive-message', saved)
        } catch (err) {
            console.error('[send-message] error:', err.message)
        }
    })

    socket.on('message-read', async (data) => {
        try {
            await messageModel.updateMany(
                { roomId: data.roomId, sender: { $ne: data.readBy }, isRead: false },
                { isRead: true, readAt: new Date() }
            )
            io.to(data.roomId).emit('message-seen', {
                roomId: data.roomId,
                readBy: data.readBy,
                readAt: new Date()
            })
        } catch (err) {
            console.error('[message-read] error:', err.message)
        }
    })

    socket.on('typing', (data) => socket.to(data.roomId).emit('user-typing', { name: data.name }))
    socket.on('stop-typing', (data) => socket.to(data.roomId).emit('user-stop-typing'))

    socket.on('disconnect', () => {
        console.log(' Disconnected:', socket.id)
    })
})

httpServer.listen(port, () =>
    console.log(`Server started on http://localhost:${port}`))


// server shutdown 
const shutdown = (signal) => {
    console.log(`[Server] ${signal} received — shutting down `)
    httpServer.close(() => {
        console.log('[Server] HTTP server closed')
        process.exit(0)
    })
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
