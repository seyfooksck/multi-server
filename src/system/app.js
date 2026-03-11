const config = require("./config/index");
const systemLogger = require("../utils/logger");
const { mongoConnect } = require("./config/db");
const { startMainSystem, setupMaster } = require("./server/main");
const { startApiSystem } = require("./server/api");
const { startDashboardSystem } = require("./server/dashboard");
const runCluster = require("../utils/cluster"); // Import clustering utility


// Initialize and Start
const init = async () => {
    try {
        await mongoConnect();

        // Start Main System
        await startMainSystem(config.PORT.MAIN);

        // Start API System
        await startApiSystem(config.PORT.API);

        // Start Dashboard System
        await startDashboardSystem(config.PORT.DASHBOARD);

        if (process.send) {
            process.send({ type: 'worker:ready' });
        }
    } catch (error) {
        systemLogger.error(`Worker ${process.pid} failed to initialize system:`, error);
        console.error(error); // Print full stack trace
        process.exit(1);
    }
};

runCluster(init, setupMaster);
