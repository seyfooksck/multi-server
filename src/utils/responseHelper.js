/**
 * Response Helper Middleware
 * Adds standardized response methods to res object.
 *
 * Usage in controllers:
 *   res.success(data, 'Operation successful');
 *   res.error(400, 'BAD_REQUEST', 'Invalid input');
 */
const responseHelper = (req, res, next) => {

    /**
     * Send a success response
     * @param {*} data - Response payload
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code (default: 200)
     */
    res.success = (data = null, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        });
    };

    /**
     * Send an error response
     * @param {number} statusCode - HTTP status code
     * @param {string} code - Error code identifier
     * @param {string} message - Error message
     * @param {*} details - Additional error details (optional)
     */
    res.error = (statusCode = 500, code = 'INTERNAL_ERROR', message = 'An error occurred', details = null) => {
        const response = {
            success: false,
            code: code,
            message: message,
            timestamp: new Date().toISOString()
        };
        if (details && process.env.NODE_ENV !== 'production') {
            response.details = details;
        }
        return res.status(statusCode).json(response);
    };

    /**
     * Send a paginated response
     * @param {Array} data - Array of items
     * @param {number} total - Total items count
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     */
    res.paginated = (data, total, page, limit) => {
        return res.status(200).json({
            success: true,
            data: data,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                pages: Math.ceil(total / limit)
            },
            timestamp: new Date().toISOString()
        });
    };

    next();
};

module.exports = responseHelper;
