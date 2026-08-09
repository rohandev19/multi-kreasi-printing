import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('MKP', {
    colors: true,
    prettyPrint: true,
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.uncolorize(),
  winston.format.json(),
);

// Define log transports
const transports = [];

// Always log to console (in development, colored; in production, you might want JSON to console too if using container stdout, but for now we'll keep it simple)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? fileFormat : consoleFormat,
  }),
);

// In production, also save to files with rotation
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error logs (level: 'error' and below)
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress old logs
      maxSize: '20m', // Rotate when file size > 20MB
      maxFiles: '14d', // Keep logs for 14 days
      format: fileFormat,
    }),
    // Combined logs (all levels)
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
  );
}

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports,
});
