import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import os from 'os'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, os.tmpdir())
    },
    filename: (_req, file, callback) => {
        const ext = path.extname(file.originalname).toLowerCase()
        callback(null, `${randomUUID()}${ext}`)
    }
})

const fileFilter = (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(new Error('Only JPEG, PNG, WEBP and GIF images are allowed'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
})

export default upload
