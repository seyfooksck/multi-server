const cluster = require('cluster');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const expressLayouts = require('express-ejs-layouts');
const systemLogger = require('../../utils/logger'); // Adjust path as needed
const i18n = require('../../utils/i18n'); // Import i18n service
const passport = require('passport');
const setupGoogleAuth = require('../../utils/auth/google');


const startDashboardSystem = async (port) => {

    const dashboardApp = express();

    // 1. Standard Middleware
    dashboardApp.use(logger('dev'));
    dashboardApp.use(express.json());
    dashboardApp.use(express.urlencoded({ extended: false }));
    dashboardApp.use(cookieParser());
    dashboardApp.use(helmet({
        contentSecurityPolicy: false,
    }));
    setupGoogleAuth(passport);
    dashboardApp.use(passport.initialize());


    // 2. Custom Middleware (i18n) - Must be after cookie parser

    dashboardApp.use(async (req, res, next) => {
        try {
            const middleware = i18n.getMiddleware();
            middleware(req, res, next);
        } catch (err) {
            console.error('i18n Middleware Error:', err);
            next();
        }
    });

    // Notification Middleware
    const notificationMiddleware = require('../../middleware/notificationMiddleware');
    dashboardApp.use(notificationMiddleware);

    // Dashboard Locals Middleware (user, role, statusClass)
    const dashboardLocals = require('../../middleware/dashboardLocals');
    dashboardApp.use(dashboardLocals);

    // 3. View Engine Setup (Layouts must be before views logic if possible, but usually order is flexible here)
    dashboardApp.set('views', path.join(__dirname, '../../views/dashboard'));
    dashboardApp.set('view engine', 'ejs');
    dashboardApp.use(expressLayouts);
    dashboardApp.set('layout', 'layout'); // default layout

    // 4. Static Files
    dashboardApp.use(express.static(path.join(__dirname, '../../public')));

    // 5. Routes
    const dashboardRoutes = require('../../routes/dashboard/index');
    dashboardApp.use('/', dashboardRoutes);

    // 6. Error Handler
    const { notFoundHandler, errorHandler } = require('../../middleware/errorHandler');
    dashboardApp.use(notFoundHandler('dashboard'));
    dashboardApp.use(errorHandler('dashboard'));


    // Start Server
    dashboardApp.listen(port, () => {
        if (cluster.isWorker && cluster.worker.id === 1) {
            systemLogger.success(`Dashboard System running on port ${port}`);
        }
    });
};

module.exports = { startDashboardSystem };
