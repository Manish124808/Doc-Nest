import mongoose from 'mongoose'

const connectDB = async () => {
    const uri = process.env.MONGO_URI

    if (!uri) {
        console.error('[MongoDB] MONGO_URI is not defined in environment variables')
        process.exit(1)
    }

    try {
        mongoose.connection.on('connected',    () => console.log('[MongoDB] Connected'))
        mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Disconnected'))
        mongoose.connection.on('error',        (err) => console.error('[MongoDB] Error:', err.message))

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        })
    } catch (error) {
        console.error('[MongoDB] Connection failed:', error.message)
        process.exit(1)
    }
}

export default connectDB
