import messageModel from '../models/messageModel.js'
import { v2 as cloudinary } from 'cloudinary'

const uploadChatImage = async (req, res) => {
    try {
        const imageFile = req.file
        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'Image file is required.' })
        }

        const { roomId, sender, senderType, name } = req.body

        if (!roomId || !sender || !senderType || !name) {
            return res.status(400).json({ success: false, message: 'roomId, sender, senderType and name are required.' })
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image',
            folder:        'chat_images'
        })

        const saved = await messageModel.create({
            roomId,
            sender,
            senderType,
            name,
            message:  '',
            imageUrl: imageUpload.secure_url,
            isRead:   false,
            readAt:   null,
            time:     new Date()
        })

        return res.status(201).json({ success: true, message: saved })

    } catch (error) {
        console.error('[uploadChatImage]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export default uploadChatImage
