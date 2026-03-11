const config = require('../../system/config/index');
const jwt = require('jsonwebtoken');
const systemLogger = require('../../utils/logger');
//Models
const User = require('../../models/User');
// Utils
const emailService = require('../../utils/email'); // Import EmailService

class AuthController {

    // Login Page
    async Login(req, res) {
        res.render('pages/auth/login', { title: 'Login', layout: false });
    }
    // Login Post
    async LoginPost(req, res) {
        try {
            systemLogger.debug('LoginPost called');
            const { loginInput, password } = req.body;
            if (!loginInput || !password) {
                return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
            }

            systemLogger.debug(`Attempting login for: ${loginInput}`);
            const user = await User.findOne({
                $or: [{ email: loginInput.toLowerCase() }, { username: loginInput }]
            });

            if (!user) {
                systemLogger.debug('User not found');
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            systemLogger.debug('User found, comparing password');
            // DIRECT COMPARISON (No Bcrypt)
            if (password !== user.password) {
                systemLogger.debug('Password mismatch');
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            systemLogger.debug('Password match, generating token');
            const token = jwt.sign({ id: user._id }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRES_IN });

            // Secure cookie in production
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            res.cookie('_sk', token, { httpOnly: true, sameSite: 'lax', secure: isSecure });

            return res.json({ success: true, message: 'Login successful', redirectUrl: '/' });

        } catch (error) {
            systemLogger.error('Login Error: ' + error.message, error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    // Register Page
    async Register(req, res) {
        res.render('pages/auth/register', { title: 'Register', layout: false });
    }

    // Register Post
    async RegisterPost(req, res) {
        try {
            systemLogger.debug('RegisterPost called');
            const { username, email, password, confirmPassword } = req.body;

            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Passwords do not match' });
            }

            systemLogger.debug(`Checking if user exists: ${email} or ${username}`);
            const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });

            if (existingUser) {
                if (existingUser.email === email.toLowerCase()) {
                    return res.status(400).json({ success: false, message: 'Email already registered' });
                }
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }

            // NO HASHING (No Bcrypt)
            const newUser = new User({
                username,
                email: email.toLowerCase(),
                password: password // Storing plaintext
            });

            systemLogger.debug('Saving new user');
            await newUser.save();

            // Send Welcome Email
            if (config.SMTP.STATUS) {
                systemLogger.debug('Sending welcome email');
                // Don't await specifically to avoid blocking response
                emailService.sendEmail(email, 'Welcome to MyApp!', 'welcome', {
                    name: newUser.username,
                    actionUrl: `${req.protocol}://${req.get('host')}/dashboard`
                }).catch(err => systemLogger.error('Failed to send welcome email', err));
            }

            // Auto-Login Logic
            systemLogger.debug('Auto-logging in new user');
            const token = jwt.sign({ id: newUser._id }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRES_IN });

            // Secure cookie
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            res.cookie('_sk', token, { httpOnly: true, sameSite: 'lax', secure: isSecure });

            return res.json({ success: true, message: 'Registration successful! Redirecting...', redirectUrl: '/' });

        } catch (error) {
            systemLogger.error('Register Error: ' + error.message, error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
    // Logout
    async Logout(req, res) {
        res.clearCookie('_sk');
        res.redirect('/auth/login');
    }
    // Forgot Password Page
    async ForgotPassword(req, res) {
        res.render('pages/auth/forgot-password', { title: 'Forgot Password', layout: false });
    }
    // Forgot Password Post
    async ForgotPasswordPost(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }

            const user = await User.findOne({ email });

            // For security, do not reveal if user does not exist
            if (!user) {
                return res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
            }

            if (config.SMTP.STATUS) {
                const token = jwt.sign({ id: user._id }, config.JWT.SECRET, { expiresIn: '1h' });
                const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;

                emailService.sendEmail(email, 'Password Reset Request', 'forgot-password', {
                    name: user.username,
                    actionUrl: resetLink
                }).catch(err => systemLogger.error('Failed to send forgot password email', err));
            }

            return res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });

        } catch (error) {
            console.error('Forgot Password Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    // Reset Password Page
    async ResetPassword(req, res) {
        const { token } = req.params;
        res.render('pages/auth/new-password', { title: 'Reset Password', token, layout: false });
    }

    // Reset Password Post
    async ResetPasswordPost(req, res) {
        try {
            const { token, password, confirmPassword } = req.body;

            if (!token || !password || !confirmPassword) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Passwords do not match' });
            }

            const decoded = jwt.verify(token, config.JWT.SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid token or user not found' });
            }

            user.password = password; // Plaintext update
            await user.save();

            if (config.SMTP.STATUS) {
                emailService.sendEmail(user.email, 'Password Changed', 'reset-success', {
                    name: user.username,
                    actionUrl: `${req.protocol}://${req.get('host')}/auth/login`
                }).catch(err => systemLogger.error('Failed to send reset success email', err));
            }

            return res.json({ success: true, message: 'Password has been reset successfully.', redirectUrl: '/auth/login' });

        } catch (error) {
            console.error('Reset Password Error:', error);
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
    }

    GoogleAuth(req, res, next) {
        return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
    }

    GoogleCallback(req, res, next) {
        return passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }, (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/auth/login');
            }
            const token = jwt.sign({ id: user.id }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRES_IN });
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            res.cookie('_sk', token, { httpOnly: true, sameSite: 'lax', secure: isSecure });
            return res.redirect('/');
        })(req, res, next);
    }
}

module.exports = new AuthController();
