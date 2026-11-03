import * as Sentry from '@sentry/nestjs';

const dsn =
  process.env.SENTRY_DSN ||
  (process.env.NODE_ENV !== 'test'
    ? 'https://2c1f9245c2895316134ca05f1c408cee@o4511506801950720.ingest.us.sentry.io/4512367218917376'
    : undefined);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

export { Sentry };


