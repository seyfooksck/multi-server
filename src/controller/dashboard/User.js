const User = require('../../models/User');
const systemLogger = require('../../utils/logger');

class UserController {

    // Profile View Page
    async profile(req, res) {
        if (!res.locals.user) {
            return res.redirect('/auth/login');
        }

        res.render('pages/profile', {
            title: 'Profile',
            navigation: { main: 'Dashboard', page: 'Profile', link: '/profile' },
            success: req.query.success || null,
            error: req.query.error || null
        });
    }

    // Profile Edit Page
    async profileEdit(req, res) {
        if (!res.locals.user) {
            return res.redirect('/auth/login');
        }

        res.render('pages/profile_edit', {
            title: 'Edit Profile',
            navigation: { main: 'Dashboard', page: 'Edit Profile', link: '/profile/edit' },
            error: req.query.error || null
        });
    }

    // Profile Edit POST
    async profileEditPost(req, res) {
        try {
            const { username, email, status, password, confirmPassword } = req.body;

            if (!username || !email) {
                return res.redirect('/profile/edit?error=' + encodeURIComponent('Username and email are required'));
            }

            // Check uniqueness
            const existingUser = await User.findOne({
                _id: { $ne: req.user.id },
                $or: [
                    { email: email.toLowerCase() },
                    { username: username }
                ]
            });

            if (existingUser) {
                const msg = existingUser.email === email.toLowerCase()
                    ? 'This email is already in use by another account'
                    : 'This username is already taken';
                return res.redirect('/profile/edit?error=' + encodeURIComponent(msg));
            }

            // Build update object
            const updateFields = {
                username: username,
                email: email.toLowerCase(),
                status: ['online', 'away', 'busy', 'offline'].includes(status) ? status : 'offline',
                updatedAt: new Date()
            };

            // Update password if provided
            if (password) {
                if (password !== confirmPassword) {
                    return res.redirect('/profile/edit?error=' + encodeURIComponent('Passwords do not match'));
                }
                if (password.length < 4) {
                    return res.redirect('/profile/edit?error=' + encodeURIComponent('Password must be at least 4 characters'));
                }
                updateFields.password = password;
            }

            await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
            return res.redirect('/profile?success=' + encodeURIComponent('Profile updated successfully'));
        } catch (error) {
            systemLogger.error('Profile Edit Post Error', error);
            return res.redirect('/profile/edit?error=' + encodeURIComponent(error.message || 'Failed to update profile'));
        }
    }

    // Users List Page (Root & Admin only)
    async users(req, res) {
        const currentUser = res.locals.user;
        if (!currentUser) {
            return res.redirect('/auth/login');
        }

        // Check if user has Root or Admin permission
        const perms = currentUser.permissions || {};
        if (!perms.root && !perms.admin) {
            return res.status(403).render('pages/error/500', {
                title: '403',
                message: 'Access Denied: You do not have permission to view this page.',
                layout: false
            });
        }

        const users = await User.find({}).sort({ createdAt: -1 });

        res.render('pages/users', {
            title: 'Users',
            users: users,
            navigation: { main: 'Dashboard', page: 'Users', link: '/users' }
        });
    }
}

module.exports = new UserController();