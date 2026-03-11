// Mongodb Multi Connection
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../../utils/logger');

const cluster = require('cluster');

// Main Database Connection
const connectDatabase = async () => {
    try {
        await mongoose.connect(`${config.DB.URI}`);
        if (cluster.isPrimary) {
            logger.success('Database connected successfully');
        }
    } catch (err) {
        logger.error('Database connection error:', err);
        throw err; // Re-throw to handle in caller
    }
}

// BACKUP DATABASE CONNECTION
const connectBackupDatabase = () => {
    try {
        const backupConnection = mongoose.createConnection(`${config.DB.BACK_UP.URI}`);

        backupConnection.on('connected', () => {
            logger.success('Backup database connected successfully');
        });

        backupConnection.on('error', (err) => {
            logger.error('Backup database connection error:', err);
        });
    } catch (err) {
        logger.error('Backup database initialization error:', err);
    }
}




const mongoConnect = async () => {
    // Connect to main database
    await connectDatabase();
    // Connect to backup database
    if (config.DB.BACK_UP.STATUS === true) {
        connectBackupDatabase();
    }
}

module.exports = {
    mongoConnect
}