const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Create a new notification
     * @param {Object} data - Notification data
     * @returns {Promise<Object>} Created notification
     */
    async createNotification(data) {
        try {
            const notification = new Notification(data);
            return await notification.save();
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications for a user
     * @param {string} userId - User ID
     * @param {number} limit - parsing limit
     * @returns {Promise<Array>} List of notifications
     */
    async getUnreadNotifications(userId, limit = 10) {
        try {
            return await Notification.find({ recipient: userId, read: false })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    }

    /**
     * Get all notifications for a user with pagination and filtering
     * @param {string} userId - User ID
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {Object} filters - Optional filters (category, type, search)
     * @returns {Promise<Object>} Notifications and total count
     */
    async getUserNotifications(userId, page = 1, limit = 20, filters = {}) {
        try {
            const query = { recipient: userId };

            if (filters.category && filters.category !== 'all') {
                query.category = filters.category;
            }

            if (filters.type && filters.type !== 'all') {
                query.type = filters.type;
            }

            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { message: { $regex: filters.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                Notification.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Notification.countDocuments(query)
            ]);

            return {
                notifications,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            return { notifications: [], total: 0, pages: 0, currentPage: 1 };
        }
    }

    /**
     * Get unread count for a user
     * @param {string} userId - User ID
     * @returns {Promise<number>} Count of unread notifications
     */
    async getUnreadCount(userId) {
        try {
            return await Notification.countDocuments({ recipient: userId, read: false });
        } catch (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }
    }

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID (for security)
     * @returns {Promise<Object>} Updated notification
     */
    async markAsRead(notificationId, userId) {
        try {
            return await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { read: true },
                { new: true }
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Update result
     */
    async markAllAsRead(userId) {
        try {
            return await Notification.updateMany(
                { recipient: userId, read: false },
                { read: true }
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
