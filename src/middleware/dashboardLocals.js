const User = require('../models/User');

/**
 * Middleware to set common dashboard locals (user, role, statusClass)
 * Runs once per request so controllers don't have to repeat user fetching.
 */
const dashboardLocals = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id);
            if (user) {
                res.locals.user = user;
                res.locals.role = user.getRole();
                res.locals.statusClass = user.getStatusClass();
            } else {
                res.locals.user = null;
                res.locals.role = 'Guest';
                res.locals.statusClass = 'secondary';
            }
        } else {
            res.locals.user = null;
            res.locals.role = 'Guest';
            res.locals.statusClass = 'secondary';
        }
        next();
    } catch (error) {
        console.error('Dashboard Locals Middleware Error:', error);
        res.locals.user = null;
        res.locals.role = 'Guest';
        res.locals.statusClass = 'secondary';
        next();
    }
};

module.exports = dashboardLocals;
