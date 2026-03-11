const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');
const systemLogger = require("./logger");

const runCluster = async (initCallback, masterInitCallback) => {
    const numCPUs = os.cpus().length;
    const isPrimary = cluster.isPrimary || cluster.isMaster;

    if (isPrimary) {
        systemLogger.info(`Master ${process.pid} is running`);

        if (masterInitCallback) {
            try {
                systemLogger.info(`Master ${process.pid} executing initialization tasks...`);
                await masterInitCallback();
                systemLogger.success(`Master ${process.pid} initialization complete.`);
            } catch (error) {
                systemLogger.error(`Master ${process.pid} initialization failed:`, error);
                process.exit(1);
            }
        }

        systemLogger.info(`Forking for ${numCPUs} CPUs...`);

        let readyWorkers = 0;
        cluster.on('message', (worker, message) => {
            if (message && message.type === 'worker:ready') {
                readyWorkers++;
                if (readyWorkers === numCPUs) {
                    systemLogger.success(`All ${numCPUs} workers are initialized and ready.`);
                }
            }
        });

        // Fork workers
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            if (!worker.exitedAfterDisconnect) {
                systemLogger.warn(`Worker ${worker.process.pid} died unexpectedly. Restarting...`);
                cluster.fork();
            }
        });

        // Graceful Shutdown (Master)
        const gracefulShutdown = async (signal) => {
            systemLogger.warn(`Master received ${signal}. Starting graceful shutdown...`);

            // Stop accepting new workers
            for (const id in cluster.workers) {
                cluster.workers[id].send({ type: 'shutdown' });
                cluster.workers[id].disconnect();
            }

            // Wait for workers to finish (max 10 seconds)
            const timeout = setTimeout(() => {
                systemLogger.warn('Workers did not exit in time. Forcing shutdown...');
                process.exit(1);
            }, 10000);

            // Wait until all workers have exited
            const waitForWorkers = () => {
                if (Object.keys(cluster.workers).length === 0) {
                    clearTimeout(timeout);
                    systemLogger.success('All workers shut down gracefully.');
                    process.exit(0);
                } else {
                    setTimeout(waitForWorkers, 500);
                }
            };
            waitForWorkers();
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } else {
        // Workers execute the init callback
        initCallback();

        // Graceful Shutdown (Worker)
        const workerShutdown = async () => {
            systemLogger.info(`Worker ${process.pid} shutting down...`);
            try {
                await mongoose.disconnect();
            } catch (err) {
                // Ignore disconnect errors during shutdown
            }
            process.exit(0);
        };

        process.on('message', (msg) => {
            if (msg && msg.type === 'shutdown') {
                workerShutdown();
            }
        });

        process.on('SIGTERM', workerShutdown);
        process.on('SIGINT', workerShutdown);
    }
};

module.exports = runCluster;

