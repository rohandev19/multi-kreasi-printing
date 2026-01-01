import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`,
        ),
      ),
);

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: logFormat,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
