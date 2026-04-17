/**
 * Performance Middleware
 * Optimizaciones para soportar 100,000+ RPS
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { createHash } from 'node:crypto';
import { checkRateLimit, incrementMetric } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Middleware de compresión HTTP
 * Reduce el tamaño de respuestas en 60-80%
 */
export const compressionMiddleware = compression({
  level: 6, // Balance entre velocidad y compresión
  threshold: 1024, // Solo comprimir respuestas > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

/**
 * Middleware de caché HTTP
 * Permite a navegadores y CDNs cachear respuestas
 */
export const cacheControlMiddleware = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Solo cachear GET requests
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      res.setHeader('Vary', 'Accept-Encoding');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
};

/**
 * Middleware de ETag
 * Evita transferir datos si no han cambiado
 */
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    if (req.method === 'GET' && res.statusCode === 200) {
      const etag = `"${createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
      res.setHeader('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return res;
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Rate Limiting con Redis (distribuido)
 * Funciona correctamente con múltiples instancias/servidores
 */
export const redisRateLimiter = (options: {
  windowSeconds: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Identificador único (IP + User-Agent)
      const identifier = `${req.ip}:${req.headers['user-agent'] || 'unknown'}`;

      const { allowed, remaining, resetIn } = await checkRateLimit(
        identifier,
        options.maxRequests,
        options.windowSeconds
      );

      // Headers de rate limit
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Date.now() + resetIn * 1000);

      if (!allowed) {
        logger.warn(`Rate limit excedido para ${req.ip} en ${req.path}`);
        return res.status(429).json({
          error: options.message || 'Demasiadas solicitudes. Por favor intenta más tarde.',
          retryAfter: resetIn,
        });
      }

      next();
    } catch (error) {
      logger.error('Error en rate limiter:', error);
      // En caso de error, permitir la request
      next();
    }
  };
};

/**
 * Middleware para medir tiempo de respuesta
 */
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  // Establecer header ANTES de enviar la respuesta
  res.setHeader('X-Response-Time', '0ms');

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = seconds * 1000 + nanoseconds / 1000000;

    // Registrar en logs si es muy lento
    if (durationMs > 1000) {
      logger.warn(`⚠️ Request lento (${durationMs.toFixed(2)}ms): ${req.method} ${req.path}`);
    }

    // Incrementar métrica
    incrementMetric(`requests:${req.method}:${res.statusCode}`);
  });

  next();
};

/**
 * Middleware para agregar headers de seguridad optimizados
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Headers de seguridad esenciales (sin sobrecargar)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security solo en producción
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Middleware para limitar tamaño de payload
 * Previene ataques DoS
 */
export const payloadSizeLimiter = (maxSizeKB: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = maxSizeKB * 1024;

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: `Payload muy grande. Máximo ${maxSizeKB}KB permitidos.`,
      });
    }

    next();
  };
};

/**
 * Middleware de timeout
 * Previene requests colgados
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`⏱️ Request timeout: ${req.method} ${req.path}`);
        res.status(408).json({
          error: 'Request timeout',
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Middleware para detectar requests duplicados
 * Útil para operaciones idempotentes
 */
export const deduplicationMiddleware = (ttlSeconds: number = 10) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Solo para POST/PUT/DELETE
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return next();
    }

    try {
      const { checkRateLimit } = await import('../config/redis');
      const requestHash = createHash('md5')
        .update(JSON.stringify({ path: req.path, body: req.body }))
        .digest('hex');

      const key = `dedup:${requestHash}`;
      const { allowed } = await checkRateLimit(key, 1, ttlSeconds);

      if (!allowed) {
        logger.warn(`🔁 Request duplicado detectado: ${req.method} ${req.path}`);
        return res.status(409).json({
          error: 'Request duplicado. Por favor espera unos segundos.',
        });
      }

      next();
    } catch (error) {
      logger.error('Error en deduplicación:', error);
      next();
    }
  };
};

/**
 * Middleware para agregar CORS optimizado
 */
export const optimizedCors = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Preflight request
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24h
      return res.status(204).end();
    }

    next();
  };
};

/**
 * Middleware para logging de métricas
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Incrementar contador de requests
  incrementMetric('requests:total');
  incrementMetric(`requests:${req.method}`);
  incrementMetric(`requests:path:${req.path.split('/')[1] || 'root'}`);

  res.on('finish', () => {
    incrementMetric(`responses:${res.statusCode}`);

    if (res.statusCode >= 500) {
      incrementMetric('responses:errors:5xx');
    } else if (res.statusCode >= 400) {
      incrementMetric('responses:errors:4xx');
    }
  });

  next();
};

/**
 * Health Check optimizado
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const { redisClient } = await import('../config/redis');
    const { default: sequelize } = await import('../config/database');

    // Checks rápidos
    const redisOk = redisClient.status === 'ready';
    const dbOk = await sequelize.authenticate().then(() => true).catch(() => false);

    const health = {
      status: redisOk && dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        redis: redisOk ? 'up' : 'down',
        database: dbOk ? 'up' : 'down',
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service unavailable',
    });
  }
};
