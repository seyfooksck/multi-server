const CryptoService = require('../utils/crypto');
const logger = require('../utils/logger');

/**
 * Middleware to decrypt incoming requests.
 * Expects 'X-Internal-Encrypted: true' header and a 'payload' field in body.
 */
const decryptRequest = (req, res, next) => {
    try {
        if (req.headers['x-internal-encrypted'] === 'true') {
            const { payload } = req.body;

            if (!payload) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Encrypted request must contain a "payload" field.'
                });
            }

            const decryptedData = CryptoService.decrypt(payload);

            // Replace body with decrypted data
            req.body = decryptedData;
        }
        next();
    } catch (error) {
        logger.error('Decryption failed:', error);
        return res.status(400).json({
            status: 'error',
            message: 'Failed to decrypt request.'
        });
    }
};

module.exports = { decryptRequest };
