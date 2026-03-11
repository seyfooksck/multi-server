/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to automatically catch errors
 * and forward them to the Express error handler.
 *
 * Usage:
 *   const asyncHandler = require('../../utils/asyncHandler');
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
