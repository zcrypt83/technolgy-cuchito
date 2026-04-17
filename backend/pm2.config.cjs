/**
 * PM2 Ecosystem Configuration
 * Configuración de clustering para alta disponibilidad y rendimiento
 *
 * Capacidad estimada:
 * - 1 instancia: ~1,000 RPS
 * - 4 instancias: ~4,000 RPS
 * - 8 instancias: ~8,000 RPS
 * - 16 instancias: ~16,000 RPS
 *
 * Para alcanzar 100,000 RPS necesitamos múltiples servidores con load balancing
 */

module.exports = {
  apps: [
    {
      name: 'inventory-api',
      script: './dist/server.js',

      // CLUSTERING CONFIGURATION
      instances: 'max', // Utiliza todos los cores disponibles
      exec_mode: 'cluster', // Modo cluster

      // OPTIMIZACIÓN DE MEMORIA
      max_memory_restart: '1G', // Reinicia si excede 1GB

      // VARIABLES DE ENTORNO
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Redis para sesiones y cache
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
        // Database pooling
        DB_POOL_MAX: 50,
        DB_POOL_MIN: 10,
        // Rate limiting (más permisivo para alto tráfico)
        RATE_LIMIT_WINDOW_MS: 60000, // 1 minuto
        RATE_LIMIT_MAX_REQUESTS: 1000, // 1000 requests/min por IP
      },

      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        watch: true,
        instances: 1,
      },

      // LOGGING
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // AUTO RESTART
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',

      // GRACEFUL SHUTDOWN
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // Worker para procesamiento en background
    {
      name: 'inventory-worker',
      script: './dist/workers/backgroundWorker.js',
      instances: 2,
      exec_mode: 'cluster',
      cron_restart: '0 0 * * *', // Reinicia diariamente a medianoche
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background',
      },
    },
  ],
};
