const cluster = require('cluster');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const expressLayouts = require('express-ejs-layouts');
const systemLogger = require('../../utils/logger'); // Adjust path as needed
const i18n = require('../../utils/i18n'); // Import i18n service
const config = require('../config');

const Language = require('../../models/Language');
const initialLanguages = require('../../utils/locale/init');

const seedLanguages = async () => {
    try {
        for (const lang of initialLanguages) {
            await Language.findOneAndUpdate(
                { code: lang.code },
                { $setOnInsert: lang },
                { upsert: true, setDefaultsOnInsert: true }
            );
        }
    } catch (error) {
        systemLogger.error(`Language sync failed: ${error.message}`);
        console.error(error);
    }
};



const { mongoConnect } = require('../config/db'); // Import mongoConnect

const startMainSystem = async (port) => {
    // Initialize things needed for Main System
    // await seedLanguages(); // Moved to Master process
    await i18n.init();

    const mainApp = express();

    // 1. Standard Middleware
    mainApp.use(logger('dev'));
    mainApp.use(express.json());
    mainApp.use(express.urlencoded({ extended: false }));
    mainApp.use(cookieParser());
    mainApp.use(helmet({
        contentSecurityPolicy: false,
    }));

    // 2. Custom Middleware (i18n) - Must be after cookie parser

    mainApp.use(async (req, res, next) => {
        try {
            const middleware = i18n.getMiddleware();
            middleware(req, res, next);
        } catch (err) {
            console.error('i18n Middleware Error:', err);
            next();
        }
    });

    // 3. View Engine Setup (Layouts must be before views logic if possible, but usually order is flexible here)
    mainApp.set('views', path.join(__dirname, `../../views/main/${config.THEME}`));
    mainApp.set('view engine', 'ejs');
    mainApp.use(expressLayouts);
    mainApp.set('layout', 'layout'); // default layout

    // 4. Static Files
    mainApp.use(express.static(path.join(__dirname, `../../public/main/${config.THEME}`)));
    mainApp.use(express.static(path.join(__dirname, '../../public')));

    // 5. Routes
    const mainRoutes = require('../../routes/main/index');
    mainApp.use('/', mainRoutes);

    // 6. Error Handler
    const { notFoundHandler, errorHandler } = require('../../middleware/errorHandler');
    mainApp.use(notFoundHandler('main'));
    mainApp.use(errorHandler('main'));


    // Start Server
    mainApp.listen(port, () => {
        if (cluster.isWorker && cluster.worker.id === 1) {
            systemLogger.success(`Main System running on port ${port} | Theme: ${config.THEME}`);
        }
    });
};

const setupMaster = async () => {
    try {
        await mongoConnect();
        await seedLanguages();
        systemLogger.success('Master process setup complete');
    } catch (error) {
        systemLogger.error('Master process setup failed:', error);
        process.exit(1);
    }
};

module.exports = { startMainSystem, setupMaster };
