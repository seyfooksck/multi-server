const systemLogger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Catches all errors thrown or forwarded via next(err).
 * Returns HTML error page for dashboard/main, JSON for API.
 */

// 404 Not Found Handler
const notFoundHandler = (type = 'dashboard') => (req, res, next) => {
    if (type === 'api') {
        return res.status(404).json({
            success: false,
            code: 'NOT_FOUND',
            message: 'The requested resource was not found'
        });
    }
    res.status(404).render('pages/error/404', {
        title: '404',
        message: 'Page Not Found',
        layout: false
    });
};

// Global Error Handler
const errorHandler = (type = 'dashboard') => (err, req, res, next) => {
    // Log the error
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    systemLogger.error(`[${type.toUpperCase()}] ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);

    // Don't leak stack traces in production
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    if (type === 'api') {
        return res.status(statusCode).json({
            success: false,
            code: err.code || 'INTERNAL_ERROR',
            message: message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        });
    }

    // Dashboard / Main - render error page
    try {
        res.status(statusCode).render(`pages/error/${statusCode === 404 ? '404' : '500'}`, {
            title: String(statusCode),
            message: message,
            layout: false
        });
    } catch (renderError) {
        // Fallback if error page template doesn't exist
        res.status(statusCode).send(`<h1>${statusCode}</h1><p>${message}</p>`);
    }
};

module.exports = { notFoundHandler, errorHandler };
