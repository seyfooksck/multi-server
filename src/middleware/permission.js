const User = require('../models/User');

/**
 * Middleware factory to check if a user has the required permission.
 * Requires 'auth' middleware to be run first.
 * 
 * @param {string} requiredPermission - The permission string to check (e.g., 'user:read', 'product:edit').
 * @returns {Function} Express middleware.
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 1. Check if user is authenticated (auth middleware should have populated req.user)
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
            }

            // 2. Fetch full user from database to get latest permissions/roles
            // We use lean() for performance if we don't need to save the document back
            const user = await User.findById(req.user.id).lean();

            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User not found in database' });
            }

            // 3. Super Admin / Support Check
            // If user has permissions.support === true, they bypass all permission checks
            const userPermissions = user.permissions || {};

            if (userPermissions.support === true) {
                return next();
            }

            // 4. Check for specific permission
            if (userPermissions[requiredPermission] === true) {
                return next();
            }

            // 5. Access Denied
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have the required permission',
                required: requiredPermission
            });

        } catch (error) {
            console.error('Permission Middleware Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error during permission check' });
        }
    };
};

module.exports = checkPermission;
