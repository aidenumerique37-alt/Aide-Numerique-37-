/**
 * ecosystem.config.js — Configuration PM2
 * Gère les deux processus : Node.js (frontend) + Python (backend FastAPI)
 *
 * Usage :
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup  (pour redémarrage auto au boot)
 */

module.exports = {
  apps: [
    // ── Backend Python (FastAPI + MongoDB) ───────────────────────────────────
    {
      name: 'aidenumerique37-backend',
      script: 'backend/venv/bin/uvicorn',
      args: 'server:app --host 127.0.0.1 --port 8001',
      cwd: './backend',
      interpreter: 'none',
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ── Frontend Node.js (Express + proxy) ───────────────────────────────────
    {
      name: 'aidenumerique37-frontend',
      script: 'server.js',
      cwd: './',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://127.0.0.1:8001',
      },
      watch: false,
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
