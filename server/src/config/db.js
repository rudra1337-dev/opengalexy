import mongoose from 'mongoose'

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('❌ Missing MONGO_URI in server/.env')
        process.exit(1)
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
