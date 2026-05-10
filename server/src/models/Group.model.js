import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        description: {
            type: String,
            default: '',
            maxlength: 200
        },

        avatar: {
            type: String,
            default: ''
        },

        // the room where group messages live
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                role: { type: String, enum: ['admin', 'member'], default: 'member' },
                joinedAt: { type: Date, default: Date.now }
            }
        ],

        isPublic: {
            type: Boolean,
            default: false  // private by default
        },

        // unique invite link code
        inviteCode: {
            type: String,
            unique: true,
            required: true
        },

        // temp control
        isTemp: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            default: null,
            index: { expireAfterSeconds: 0 }
        }
    },
    {
        timestamps: true
    }
)

// groupSchema.index({ inviteCode: 1 })
groupSchema.index({ isPublic: 1 })

const Group = mongoose.model('Group', groupSchema)

export default Group