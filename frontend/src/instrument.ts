import * as Sentry from '@sentry/react';

const dsn =
  import.meta.env.VITE_SENTRY_DSN ||
  'https://2c1f9245c2895316134ca05f1c408cee@o4511506801950720.ingest.us.sentry.io/4512367218917376';

Sentry.init({
  dsn,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Tracing
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.mkprinting\.my\.id/],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE || 'development',
});

// Expose Sentry to window in development for testing in DevTools console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).Sentry = Sentry;
}

export { Sentry };

