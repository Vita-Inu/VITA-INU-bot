import winston from 'winston';
import {DateTime} from 'luxon';
import {Console, File} from 'winston/lib/winston/transports';

const {combine} = winston.format;

export const getLogger = () => {
    const YYYYMMDD : string = getYYYYMMDD();
    // Create Winston logger
    const logger = winston.createLogger({
        level: 'info',
        format: combine(winston.format.simple(), winston.format.timestamp()),
        transports: [
            new File({filename: `./logs/${YYYYMMDD}_vitebot.log`, level: 'info'}),
        ],
    });

    logger.add(
        new Console({
            format: winston.format.simple(),
        })
    );

    return logger;
};

// Return current date in YYYYMMDD format
export const getYYYYMMDD = () => {
    return DateTime.now().toFormat("yyyyMMdd");
}
