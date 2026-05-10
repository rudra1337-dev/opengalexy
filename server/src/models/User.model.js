import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 20,
            match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
        },

        displayName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        googleId: {
            type: String,
            required: true,
            unique: true
        },

        avatar: {
            type: String,
            default: ''
        },

        usernameSet: {
            type: Boolean,
            default: false
        },

        isTemp: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            default: null,
            index: { expireAfterSeconds: 0 }  // ← MongoDB TTL index
        },

        defaultMessageMode: {
            type: String,
            enum: ['permanent', 'temp'],
            default: 'permanent'
        },

        burnAfterRead: {
            type: Boolean,
            default: false
        },

        isOnline: {
            type: Boolean,
            default: false
        },

        lastSeen: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true  // ← auto adds createdAt and updatedAt
    }
)

const User = mongoose.model('User', userSchema)

export default User