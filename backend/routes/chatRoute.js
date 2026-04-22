import express from 'express'
import chat from '../controller/chatController.js'
import messageModel from '../models/messageModel.js'
import uploadChatImage from '../controller/uploadController.js'
import upload from '../middleware/multer.js'
import authUser from '../middleware/authUser.js'

const chatRouter = express.Router()

// AI chat message
chatRouter.post('/message', chat)

// Chat image upload
chatRouter.post('/upload-image', authUser, upload.single('image'), uploadChatImage)

// Message history for a room (paginated)
chatRouter.get('/history/:roomId', authUser, async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(100, parseInt(req.query.limit) || 50)
        const skip  = (page - 1) * limit

        const messages = await messageModel
            .find({ roomId: req.params.roomId })
            .sort({ time: -1 })
            .skip(skip)
            .limit(limit)

        return res.json({ success: true, messages: messages.reverse(), page, limit })
    } catch (err) {
        console.error('[chat/history]', err.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
})

// Mark messages as read
chatRouter.put('/mark-read/:roomId', authUser, async (req, res) => {
    try {
        const { readBy } = req.body

        if (!readBy) {
            return res.status(400).json({ success: false, message: 'readBy is required.' })
        }

        await messageModel.updateMany(
            { roomId: req.params.roomId, sender: { $ne: readBy }, isRead: false },
            { isRead: true, readAt: new Date() }
        )

        return res.json({ success: true, message: 'Messages marked as read.' })
    } catch (err) {
        console.error('[chat/mark-read]', err.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
})

export default chatRouter
