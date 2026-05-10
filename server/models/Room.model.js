import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['direct', 'group'],
            required: true
        },

        // for direct chats — exactly 2 members
        // for group chats — 2+ members
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],

        // only for group rooms
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null
        },

        // temp control
        isTemp: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            default: null,
            index: { expireAfterSeconds: 0 }  // ← MongoDB auto-deletes when expired
        },

        // last message preview (for chat list UI)
        lastMessage: {
            content: { type: String, default: '' },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            sentAt: { type: Date, default: null }
        }
    },
    {
        timestamps: true
    }
)

// index to quickly find direct room between 2 users
roomSchema.index({ members: 1 })
roomSchema.index({ type: 1 })

const Room = mongoose.model('Room', roomSchema)

export default Room