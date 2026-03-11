const notificationService = require('../services/notificationService');

/**
 * Middleware to touch notifications data to res.locals
 */
const notificationMiddleware = async (req, res, next) => {
    try {
        // Only run if user is authenticated
        if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user) {
            const userId = req.user.id || req.user._id;

            // Fetch recent unread notifications (or just recent ones) for the dropdown
            const notifications = await notificationService.getUnreadNotifications(userId, 5);

            // Fetch total unread count
            const unreadCount = await notificationService.getUnreadCount(userId);

            // Make available to views
            res.locals.notifications = notifications;
            res.locals.unreadCount = unreadCount;
        } else {
            res.locals.notifications = [];
            res.locals.unreadCount = 0;
        }
        next();
    } catch (error) {
        console.error('Notification Middleware Error:', error);
        // Don't break the request if notifications fail
        res.locals.notifications = [];
        res.locals.unreadCount = 0;
        next();
    }
};

module.exports = notificationMiddleware;
