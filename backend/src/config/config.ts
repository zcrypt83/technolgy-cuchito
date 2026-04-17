import dotenv from 'dotenv';

dotenv.config();

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'technology_cuchito_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: parseBoolean(process.env.DB_SSL, false),
    dialect: 'postgres' as const,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 50,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },

  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0')
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },

  rateLimit: {
    authWindowMs: parsePositiveInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000),
    authMax: parsePositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 30),
    apiWindowMs: parsePositiveInt(process.env.RATE_LIMIT_API_WINDOW_MS, 15 * 60 * 1000),
    apiMax: parsePositiveInt(process.env.RATE_LIMIT_API_MAX, 50000)
  }
};

/**
 * Validar que las variables de entorno requeridas estén configuradas
 */
export function validateConfig() {
  const requiredEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET
  };

  // Validar JWT_SECRET no sea el default
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'default-secret-change-in-production'
  ) {
    throw new Error(
      '❌ ERROR CRÍTICO: JWT_SECRET no está configurado o usa el valor por defecto.\n' +
      'Por favor, genera un secret único y congúralo en la variable de entorno JWT_SECRET.\n\n' +
      'Ejecuta este comando para generar uno:\n' +
      "node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n\n" +
      'Luego agrega a tu archivo .env:\n' +
      'JWT_SECRET=<resultado_anterior>'
    );
  }

  // Validar otras variables
  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) {
    if (!process.env.DB_HOST) missing.push('DB_HOST');
    if (!process.env.DB_USER) missing.push('DB_USER');
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ ERROR: Variables de entorno requeridas faltantes: ${missing.join(', ')}\n` +
      'Por favor, configura estas variables en tu archivo .env'
    );
  }
}
