import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/config';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';
import {
  responseTimeMiddleware,
  securityHeadersMiddleware,
  etagMiddleware,
  requestTimeout,
  payloadSizeLimiter,
  cacheControlMiddleware
} from './middleware/performance';

// Rutas
import authRoutes from './routes/authRoutes';
import productoRoutes from './routes/productoRoutes';
import inventarioRoutes from './routes/inventarioRoutes';
import movimientoRoutes from './routes/movimientoRoutes';
import almacenRoutes from './routes/almacenRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import auditoriaRoutes from './routes/auditoriaRoutes';
import configuracionRoutes from './routes/configuracionRoutes';

const app = express();
const authWindowMinutes = Math.ceil(config.rateLimit.authWindowMs / 60000);

// Rate limiters
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: { error: `Demasiados intentos de autenticación. Intenta de nuevo en ${authWindowMinutes} minutos.` },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      error: `Demasiados intentos de autenticación. Intenta de nuevo en ${authWindowMinutes} minutos.`
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.apiWindowMs,
  max: config.rateLimit.apiMax,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middlewares de seguridad y compresión
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Middlewares de rendimiento
app.use(responseTimeMiddleware);
app.use(securityHeadersMiddleware);
app.use(etagMiddleware);
app.use(requestTimeout(30000));
app.use(payloadSizeLimiter(100));
app.use(cacheControlMiddleware(300));

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/almacenes', almacenRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de verificación
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Validar configuración de entorno
    validateConfig();
    logger.info('✅ Validación de configuración: OK');

    // Conectar a Redis (opcional en desarrollo)
    try {
      await connectRedis();
      logger.info('✅ Redis conectado: OK');
    } catch (redisError) {
      if (process.env.NODE_ENV === 'production') {
        logger.error('Redis es REQUERIDO en producción');
        throw redisError;
      }
      logger.warn('⚠️  Redis no disponible (opcional en desarrollo)');
      logger.warn('⚠️  Sistema funcionará pero sin caché distribuido');
    }

    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Importar modelos para establecer relaciones
    await import('./models/index');
    logger.info('Modelos de base de datos cargados correctamente');

    // Iniciar servidor
    app.listen(config.port, () => {
      logger.info(`Servidor iniciado en puerto ${config.port}`);
      logger.info(`Entorno: ${config.nodeEnv}`);
      logger.info(`Base de datos: ${config.database.name}`);
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🚀 Servidor Backend - Technology Cuchito               ║
║                                                            ║
║    Servidor corriendo en: http://localhost:${config.port}        ║
║    Entorno: ${config.nodeEnv}                             ║
║    Base de datos: ${config.database.name}                 ║
║                                                            ║
║    📡 API Routes:                                          ║
║    - POST /api/auth/login                                 ║
║    - POST /api/auth/register                              ║
║    - GET  /api/productos                                  ║
║    - GET  /api/inventario                                 ║
║    - GET  /api/movimientos                                ║
║    - GET  /api/almacenes                                  ║
║    - GET  /api/usuarios                                   ║
║    - GET  /api/categorias                                 ║
║    - GET  /api/proveedores                                ║
║    - GET  /api/auditoria                                  ║
║                                                            ║
║    🔒 Seguridad:                                           ║
║    - Rate limiting: ✅ Activado                            ║
║    - Logging: ✅ Winston configurado                       ║
║    - CORS: ✅ Habilitado                                   ║
║    - Helmet: ✅ Activo                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor', { error });
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
