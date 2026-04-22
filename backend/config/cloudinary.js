import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.error('[Cloudinary] Missing credentials in environment variables')
        process.exit(1)
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key:    CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure:     true
    })

    console.log('[Cloudinary] Configured')
}

export default connectCloudinary
