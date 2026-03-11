const jwt = require('jsonwebtoken');
const config = require('../system/config/index');

const adminAuthMiddleware = (redirectUrl = null) => (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization;
    if (!token) {
        if (redirectUrl) {
            return res.redirect(redirectUrl);
        }
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
    jwt.verify(token, config.JWT.SECRET, (err, decoded) => {
        if (err) {
            if (redirectUrl) {
                return res.redirect(redirectUrl);
            }
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = adminAuthMiddleware;