import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { execSync } from 'child_process';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { loggerConfig } from './common/logger/logger.config';

const bootstrapLogger = new Logger('Bootstrap');

async function runPrismaCommands() {
  const isProd = process.env.NODE_ENV === 'production';
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const shouldRun = isProd || hasDbUrl || Boolean(process.env.FORCE_MIGRATE);
  if (!shouldRun) return;

  bootstrapLogger.log(
    `[Bootstrap] Triggered (NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL=${hasDbUrl ? 'set' : 'unset'})`,
  );

  bootstrapLogger.log('Running Prisma migrations (deploy)...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    bootstrapLogger.log('Migrations completed.');
  } catch (err) {
    bootstrapLogger.warn(
      'Migration skipped or failed: ' + (err as Error).message,
    );
  }

  bootstrapLogger.log('Running Prisma seed (idempotent via seed.ts)...');
  try {
    execSync('npx ts-node --transpile-only prisma/seed.ts', {
      stdio: 'inherit',
    });
    bootstrapLogger.log('Seed completed.');
  } catch (err) {
    bootstrapLogger.warn('Seed skipped or failed: ' + (err as Error).message);
  }
}

async function bootstrap() {
  await runPrismaCommands();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: loggerConfig,
  });

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const isProd = process.env.NODE_ENV === 'production';
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const localDevOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ];

  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim())
    : localDevOrigins;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (isProd && !allowedOriginsEnv) {
        bootstrapLogger.warn(
          `ALLOWED_ORIGINS not set in production — allowing origin dynamically: ${origin}. Set ALLOWED_ORIGINS for strict CORS.`,
        );
        callback(null, true);
        return;
      }
      bootstrapLogger.error(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  bootstrapLogger.log(
    `🚀 Server running on port ${port} (PID: ${process.pid})`,
  );
  bootstrapLogger.log(`NODE_ENV=${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
