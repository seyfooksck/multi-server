const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');
const config = require('../../system/config/index');

const DEFAULT_SCOPE = ['profile', 'email'];
const DEFAULT_CALLBACK_URL = '/dashboard/auth/google/callback';

const setupGoogleAuth = (passportInstance, callbackURL = DEFAULT_CALLBACK_URL) => {
    if (!passportInstance) {
        throw new Error('passport instance is required');
    }

    const strategyVerify = async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined;
            const username = profile.displayName || (email ? email.split('@')[0] : `user_${profile.id}`);

            const newUser = await User.create({
                googleId: profile.id,
                username,
                email: email || `${profile.id}@google.local`
            });

            return done(null, newUser);
        } catch (err) {
            return done(err);
        }
    };

    passportInstance.use(new GoogleStrategy({
        clientID: config.KEYS.GOOGLE.CLIENT_ID,
        clientSecret: config.KEYS.GOOGLE.CLIENT_SECRET,
        callbackURL,
        scope: DEFAULT_SCOPE
    }, strategyVerify));

    return passportInstance;
};

module.exports = setupGoogleAuth;
