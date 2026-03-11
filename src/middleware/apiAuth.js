const Api = require('../models/api/Api');
const systemLogger = require('../utils/logger');

const apiAuth = async (req, res, next) => {
    // 1. Content-Type Check (only for methods with body)
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];
    if (methodsWithBody.includes(req.method) && !req.is('application/json')) {
        return res.status(400).json({
            success: false,
            code: 'API_INVALID_CONTENT_TYPE',
            message: 'Invalid Content-Type. Expected application/json',
        });
    }

    // 2. Check x-api-secret
    const apiSecret = req.headers['x-api-secret'];
    if (!apiSecret) {
        return res.status(401).json({
            success: false,
            code: 'API_MISSING_SECRET',
            message: 'Unauthorized: Missing API Secret',
        });
    }

    try {
        // 3. Find API Key in DB
        const apiRecord = await Api.findOne({ secret: apiSecret });

        if (!apiRecord) {
            return res.status(401).json({
                success: false,
                code: 'API_INVALID_SECRET',
                message: 'Unauthorized: Invalid API Secret',
            });
        }

        // 4. Check Status
        if (!apiRecord.status) {
            return res.status(403).json({
                success: false,
                code: 'API_KEY_INACTIVE',
                message: 'Forbidden: API Key is inactive',
            });
        }

        // 5. Check IP Whitelist
        if (apiRecord.ip && apiRecord.ip.length > 0) {
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            // Handle ::ffff: prefix for IPv4 mapped to IPv6
            const normalizedIp = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

            // Check if normalized IP or original IP is in the whitelist
            const isAllowed = apiRecord.ip.includes(normalizedIp) || apiRecord.ip.includes(clientIp);

            if (!isAllowed) {
                systemLogger.warn(`API Access Denied (IP): ${normalizedIp} for Key: ${apiRecord._id}`);
                return res.status(403).json({
                    success: false,
                    code: 'API_IP_DENIED',
                    message: 'Forbidden: IP Address not allowed',
                });
            }
        }

        // Attach API record to request for downstream use
        req.api = apiRecord;
        next();

    } catch (error) {
        systemLogger.error(`API Auth Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            code: 'API_Internal_Error',
            message: 'Internal Server Error during authentication',
        });
    }
};

module.exports = apiAuth;
