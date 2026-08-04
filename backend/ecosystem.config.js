// PM2 Ecosystem Configuration
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
//
// Usage:
//   pm2 start ecosystem.config.js --env production   # start cluster
//   pm2 reload ecosystem.config.js --env production   # zero-downtime restart
//   pm2 stop all                                      # stop all
//   pm2 monit                                         # real-time monitoring

module.exports = {
  apps: [
    {
      // ── Main API Server ────────────────────────────────────
      name: 'mkp-backend',
      script: 'dist/main.js',

      // Cluster mode: one worker per CPU core
      instances: 'max',
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // combine logs from all workers into one file

      // Stability
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Graceful shutdown
      // PM2 sends SIGINT → app has kill_timeout ms to finish requests → SIGKILL
      kill_timeout: 5000,
      // How long PM2 waits for the app to be "ready" before considering it online
      listen_timeout: 10000,
      // Wait 500ms between restarting each cluster worker (zero-downtime)
      restart_delay: 500,

      // Exponential backoff restart delay on crashes
      exp_backoff_restart_delay: 100,
    },
  ],
};
