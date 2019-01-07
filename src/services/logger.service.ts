import { createLogger, format, transports } from 'winston';
import * as dailyRotateFile from 'winston-daily-rotate-file';

class Logger {

    constructor() {}

    public winston() {
        return createLogger({
            level: 'error',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
            ),
            transports: [
                new transports.Console({
                    level: 'debug',
                    format: format.combine(
                        format.colorize(),
                        format.printf(info => `${info.timestamp} [${info.level}] -> ${info.message}`),
                    )
                }),
                new dailyRotateFile({
                    level: 'warn',
                    filename: '%DATE%_archive.log',
                    datePattern: 'YYYY-MM-DD',
                    dirname: `${process.cwd()}/logs`,
                    zippedArchive: true,
                    maxSize: '20m',
                    format: format.combine(
                        format.printf(info => `${info.timestamp} [${info.level}] -> ${info.message}`),
                    )
                })
            ]
        });
    }
}

export default new Logger().winston();
