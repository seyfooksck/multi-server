const winston = require('winston');
const chalk = require('chalk');

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        success: 3,
        start: 4,
        debug: 5,
    },
    colors: {
        error: 'bgRed',
        warn: 'bgYellow',
        info: 'bgBlue',
        success: 'bgGreen',
        start: 'bgCyan',
        debug: 'bgGray',
    },
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'nodejs-app' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.printf(({ timestamp, level, message, stack }) => {
                    const ts = chalk.gray(timestamp);

                    // Pad level to 7 chars (length of "success")
                    const padding = 7;
                    const upperLevel = level.toUpperCase();
                    const paddedLevel = upperLevel.padEnd(padding);

                    // Map level to color
                    const colorMap = customLevels.colors;
                    const color = colorMap[level] || 'white';

                    // Apply color to the padded level
                    const coloredLevel = chalk[color] ? chalk[color](paddedLevel) : paddedLevel;

                    return `${ts} ${coloredLevel} ${message}${stack ? '\n' + stack : ''}`;
                })
            )
        }),
        new winston.transports.File({
            filename: 'src/logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'src/logs/app.log'
        })
    ],
});

module.exports = {
    info: (message) => logger.info(message),
    error: (message) => logger.error(message),
    warn: (message) => logger.warn(message),
    debug: (message) => logger.debug(message),
    success: (message) => logger.success(message),
    start: (message) => logger.start(message),
};
