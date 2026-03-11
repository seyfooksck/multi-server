const cluster = require('cluster');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/index');
const systemLogger = require('../../utils/logger');
const responseHelper = require('../../utils/responseHelper');

const startApiSystem = (port) => {
    const API = express();

    API.use(logger('dev'));
    API.use(express.json());
    API.use(express.urlencoded({ extended: false }));
    API.use(cookieParser());
    API.use(helmet({
        contentSecurityPolicy: false,
    }));

    // Response Helper (res.success, res.error, res.paginated)
    API.use(responseHelper);

    // Rate Limiting (100 requests per 15 minutes per IP)
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.'
        }
    });
    API.use(apiLimiter);

    API.use(express.static(path.join(__dirname, '../../public')));

    // Routes
    const apiRoutes = require('../../routes/api/index');
    API.use(`/api/${config.API.VERSION}`, apiRoutes);

    // Error Handler
    const { notFoundHandler, errorHandler } = require('../../middleware/errorHandler');
    API.use(notFoundHandler('api'));
    API.use(errorHandler('api'));


    // Start Server
    API.listen(port, () => {
        if (cluster.isWorker && cluster.worker.id === 1) {
            systemLogger.success(`Api System running on port ${port}`);
        }
    });
};

module.exports = { startApiSystem };

