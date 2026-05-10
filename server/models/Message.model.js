import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        type: {
            type: String,
            enum: ['text', 'file', 'image'],
            default: 'text'
        },

        // temp control
        isTemp: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            default: null,
            index: { expireAfterSeconds: 0 }  // ← auto-deletes expired messages
        },

        // burn after read
        isBurnAfterRead: {
            type: Boolean,
            default: false
        },

        isBurned: {
            type: Boolean,
            default: false
        },

        // seen receipts
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        // file sharing
        fileUrl: {
            type: String,
            default: null
        },

        fileName: {
            type: String,
            default: null
        },

        fileSize: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
)

// index for fast message fetching per room
messageSchema.index({ roomId: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)

export default Message