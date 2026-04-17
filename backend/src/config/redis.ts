/**
 * Redis Configuration
 * Sistema de caché distribuido para alto rendimiento
 *
 * Beneficios:
 * - Reduce carga en PostgreSQL en un 80-90%
 * - Respuestas 10-100x más rápidas
 * - Soporta 100,000+ RPS con cluster Redis
 */

import Redis from 'ioredis';
import { logger } from './logger';

const isProduction = process.env.NODE_ENV === 'production';
let redisAvailable = false;
let redisErrorAlreadyLogged = false;
const redisUrl = process.env.REDIS_URL;

// Configuración de Redis
const redisConfig = {
  retryStrategy: (times: number) => {
    // En desarrollo, si Redis no está disponible, evitar bucles de reconexión y spam de logs.
    if (!isProduction) return null;
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: isProduction ? 3 : 1,
  enableReadyCheck: true,
  lazyConnect: true,
};

const redisBaseConfig = redisUrl
  ? redisConfig
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      ...redisConfig
    };

const createRedisClient = () =>
  redisUrl ? new Redis(redisUrl, redisConfig) : new Redis(redisBaseConfig);

// Cliente principal de Redis
export const redisClient = createRedisClient();

// Cliente para publicación/suscripción
export const redisPubClient = createRedisClient();
export const redisSubClient = createRedisClient();

// Manejo de eventos
redisClient.on('connect', () => {
  logger.info('✅ Redis conectado correctamente');
  redisAvailable = true;
  redisErrorAlreadyLogged = false;
});

redisClient.on('error', (err) => {
  if (!isProduction) {
    if (!redisErrorAlreadyLogged) {
      logger.warn('⚠️ Redis no disponible en desarrollo. Se desactiva caché distribuida.');
      redisErrorAlreadyLogged = true;
    }
    return;
  }
  logger.error('❌ Error de Redis:', err);
});

redisClient.on('ready', () => {
  logger.info('🚀 Redis listo para recibir comandos');
});

// Conectar al iniciar
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    await redisPubClient.connect();
    await redisSubClient.connect();
    redisAvailable = true;
    logger.info('✅ Todos los clientes Redis conectados');
  } catch (error) {
    redisAvailable = false;
    if (isProduction) {
      logger.error('❌ Error conectando a Redis:', error);
    }
    throw error;
  }
};

// Desconectar Redis
export const disconnectRedis = async (): Promise<void> => {
  redisAvailable = false;
  await Promise.allSettled([
    redisClient.quit(),
    redisPubClient.quit(),
    redisSubClient.quit()
  ]);
  logger.info('Redis desconectado');
};

/**
 * Cache Helper Functions
 */

// TTL por defecto: 5 minutos
const DEFAULT_TTL = 300;

/**
 * Obtener datos del cache o ejecutar función si no existe
 */
export async function cacheGet<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  if (!redisAvailable) {
    return await fetchFunction();
  }

  try {
    // Intentar obtener del cache
    const cached = await redisClient.get(key);

    if (cached) {
      logger.debug(`✅ Cache HIT: ${key}`);
      return JSON.parse(cached) as T;
    }

    // Cache MISS - ejecutar función
    logger.debug(`❌ Cache MISS: ${key}`);
    const data = await fetchFunction();

    // Guardar en cache
    await redisClient.setex(key, ttl, JSON.stringify(data));

    return data;
  } catch (error) {
    logger.error(`Error en cache para ${key}:`, error);
    // Si falla Redis, ejecutar función directamente
    return await fetchFunction();
  }
}

/**
 * Invalidar cache por patrón
 */
export async function invalidateCache(pattern: string): Promise<number> {
  if (!redisAvailable) return 0;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redisClient.del(...keys);
    logger.info(`🗑️  Invalidados ${deleted} keys con patrón: ${pattern}`);
    return deleted;
  } catch (error) {
    logger.error('Error invalidando cache:', error);
    return 0;
  }
}

/**
 * Configuración de TTL recomendados
 */
export const CacheTTL = {
  // Datos que cambian raramente
  CATEGORIAS: 3600,        // 1 hora
  PROVEEDORES: 3600,       // 1 hora
  ALMACENES: 1800,         // 30 minutos

  // Datos que cambian frecuentemente
  PRODUCTOS: 300,          // 5 minutos
  INVENTARIO: 60,          // 1 minuto
  USUARIOS: 600,           // 10 minutos

  // Datos en tiempo real
  STOCK_ACTUAL: 10,        // 10 segundos
  ALERTAS: 30,             // 30 segundos

  // Sesiones
  SESSION: 86400,          // 24 horas
  AUTH_TOKEN: 3600,        // 1 hora
};

/**
 * Prefijos de keys para organización
 */
export const CacheKeys = {
  PRODUCTO: (id: number) => `producto:${id}`,
  PRODUCTOS_LIST: (page: number, limit: number) => `productos:list:${page}:${limit}`,
  PRODUCTOS_CATEGORIA: (categoriaId: number) => `productos:categoria:${categoriaId}`,
  INVENTARIO: (productoId: number, almacenId: number) => `inventario:${productoId}:${almacenId}`,
  INVENTARIO_ALMACEN: (almacenId: number) => `inventario:almacen:${almacenId}`,
  STOCK_ALERTAS: () => `stock:alertas`,
  MOVIMIENTOS_LIST: (page: number) => `movimientos:list:${page}`,
  USUARIO: (id: number) => `usuario:${id}`,
  SESSION: (token: string) => `session:${token}`,
};

/**
 * Rate Limiting con Redis
 * Más eficiente que express-rate-limit para múltiples instancias
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (!redisAvailable) {
    return { allowed: true, remaining: maxRequests, resetIn: windowSeconds };
  }

  const key = `ratelimit:${identifier}`;

  try {
    const current = await redisClient.incr(key);

    if (current === 1) {
      // Primera request - establecer TTL
      await redisClient.expire(key, windowSeconds);
    }

    const ttl = await redisClient.ttl(key);

    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
      resetIn: ttl,
    };
  } catch (error) {
    logger.error('Error en rate limiting:', error);
    // En caso de error, permitir la request
    return { allowed: true, remaining: maxRequests, resetIn: windowSeconds };
  }
}

/**
 * Contador de métricas en Redis
 */
export async function incrementMetric(metricName: string, value: number = 1): Promise<void> {
  if (!redisAvailable) return;

  try {
    const key = `metrics:${metricName}:${new Date().toISOString().split('T')[0]}`;
    await redisClient.incrby(key, value);
    await redisClient.expire(key, 86400 * 30); // Guardar 30 días
  } catch (error) {
    logger.error('Error incrementando métrica:', error);
  }
}

export default redisClient;
