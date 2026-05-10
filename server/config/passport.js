import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.model.js'

const initPassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id })

                    if (user) return done(null, user)

                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                        username: `user_${profile.id.substring(0, 8)}`
                    })

                    return done(null, user)

                } catch (error) {
                    return done(error, null)
                }
            }
        )
    )
}

export default initPassport