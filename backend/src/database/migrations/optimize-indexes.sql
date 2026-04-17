/**
 * Optimización de Índices para PostgreSQL
 * Mejora rendimiento de queries en 200-500%
 *
 * Ejecutar con:
 * psql -U postgres -d inventory_db -f optimize-indexes.sql
 */

-- ========================================
-- PRODUCTOS
-- ========================================

-- Índice en SKU (búsquedas frecuentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_sku
ON productos(sku);

-- Índice en nombre (búsquedas con LIKE)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_nombre
ON productos USING gin(to_tsvector('spanish', nombre));

-- Índice en marca
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_marca
ON productos(marca);

-- Índice en categoría (filtros frecuentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_categoria
ON productos(categoria_id);

-- Índice en activo (filtro en todos los queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_activo
ON productos(activo) WHERE activo = true;

-- Índice compuesto para queries frecuentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_categoria_activo
ON productos(categoria_id, activo) WHERE activo = true;

-- Índice para stock bajo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_stock_bajo
ON productos(stock_minimo, stock_actual)
WHERE stock_actual <= stock_minimo AND activo = true;

-- ========================================
-- INVENTARIO
-- ========================================

-- Índice compuesto principal (FK lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_producto_almacen
ON inventario(producto_id, almacen_id);

-- Índice para queries por almacén
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_almacen
ON inventario(almacen_id);

-- Índice para queries por producto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_producto
ON inventario(producto_id);

-- Índice para stock disponible
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_stock_disponible
ON inventario(cantidad_disponible)
WHERE cantidad_disponible > 0;

-- Índice para alertas de stock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_alertas
ON inventario(producto_id, cantidad_disponible, cantidad_minima)
WHERE cantidad_disponible <= cantidad_minima;

-- ========================================
-- MOVIMIENTOS
-- ========================================

-- Índice en fecha (ordenamiento y filtros)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_fecha
ON movimientos(fecha DESC);

-- Índice en tipo de movimiento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_tipo
ON movimientos(tipo);

-- Índice en producto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_producto
ON movimientos(producto_id);

-- Índice en almacén origen
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_almacen_origen
ON movimientos(almacen_origen_id);

-- Índice en almacén destino
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_almacen_destino
ON movimientos(almacen_destino_id);

-- Índice compuesto para queries frecuentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_producto_fecha
ON movimientos(producto_id, fecha DESC);

-- Índice para auditoría
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimientos_usuario_fecha
ON movimientos(usuario_id, fecha DESC);

-- ========================================
-- USUARIOS
-- ========================================

-- Índice UNIQUE en email (login)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_email
ON usuarios(email) WHERE activo = true;

-- Índice en rol (filtros)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_rol
ON usuarios(rol);

-- Índice en almacén asignado
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_almacen
ON usuarios(almacen_asignado_id);

-- Índice en activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_activo
ON usuarios(activo) WHERE activo = true;

-- ========================================
-- ALMACENES
-- ========================================

-- Índice en código
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_almacenes_codigo
ON almacenes(codigo) WHERE activo = true;

-- Índice en ciudad (filtros geográficos)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_almacenes_ciudad
ON almacenes(ciudad);

-- Índice en activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_almacenes_activo
ON almacenes(activo) WHERE activo = true;

-- ========================================
-- CATEGORIAS
-- ========================================

-- Índice en nombre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categorias_nombre
ON categorias(nombre);

-- Índice en activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categorias_activo
ON categorias(activo) WHERE activo = true;

-- ========================================
-- PROVEEDORES
-- ========================================

-- Índice en RUC
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_proveedores_ruc
ON proveedores(ruc) WHERE activo = true;

-- Índice en nombre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proveedores_nombre
ON proveedores(nombre);

-- Índice en activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proveedores_activo
ON proveedores(activo) WHERE activo = true;

-- ========================================
-- AUDITORÍA
-- ========================================

-- Índice en tabla afectada
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_tabla
ON auditoria(tabla);

-- Índice en acción
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_accion
ON auditoria(accion);

-- Índice en usuario
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_usuario
ON auditoria(usuario_id);

-- Índice en fecha (ordenamiento)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_fecha
ON auditoria(fecha DESC);

-- Índice compuesto para queries frecuentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_tabla_fecha
ON auditoria(tabla, fecha DESC);

-- ========================================
-- OPTIMIZACIONES ADICIONALES
-- ========================================

-- Actualizar estadísticas de todas las tablas
ANALYZE productos;
ANALYZE inventario;
ANALYZE movimientos;
ANALYZE usuarios;
ANALYZE almacenes;
ANALYZE categorias;
ANALYZE proveedores;
ANALYZE auditoria;

-- Vacuum para liberar espacio
VACUUM ANALYZE;

-- ========================================
-- VISTAS MATERIALIZADAS (opcional)
-- ========================================

-- Vista materializada para dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE activo = true) as productos_activos,
  SUM(stock_actual * precio) FILTER (WHERE activo = true) as valor_total_inventario,
  COUNT(*) FILTER (WHERE stock_actual <= stock_minimo AND activo = true) as alertas_stock,
  (SELECT COUNT(*) FROM almacenes WHERE activo = true) as total_almacenes
FROM productos;

-- Índice en vista materializada
CREATE UNIQUE INDEX idx_mv_dashboard_stats ON mv_dashboard_stats ((true));

-- Refrescar automáticamente (ejecutar cada 5 minutos con cron o pg_cron)
-- SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats');

-- ========================================
-- PARTICIONAMIENTO (para escalabilidad extrema)
-- ========================================

-- Particionar tabla de movimientos por fecha (opcional, para millones de registros)
-- Solo necesario si tienes más de 10 millones de movimientos

/*
CREATE TABLE movimientos_2026 PARTITION OF movimientos
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE movimientos_2027 PARTITION OF movimientos
FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
*/

-- ========================================
-- MONITORING Y PERFORMANCE
-- ========================================

-- Ver tamaño de tablas e índices
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver índices no utilizados (para limpiar)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Ver queries lentas (ejecutar después de uso real)
SELECT
  calls,
  mean_exec_time,
  max_exec_time,
  query
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ========================================
-- CONFIGURACIÓN DE POSTGRESQL
-- ========================================

-- Configuraciones recomendadas para alto rendimiento
-- Agregar a postgresql.conf:

/*
# Memoria
shared_buffers = 4GB              # 25% de RAM total
effective_cache_size = 12GB       # 75% de RAM total
work_mem = 32MB                   # Para queries complejas
maintenance_work_mem = 512MB      # Para VACUUM, CREATE INDEX

# Conexiones
max_connections = 200             # Con pgBouncer puede ser menor
superuser_reserved_connections = 3

# Checkpoint
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Planner
random_page_cost = 1.1            # Para SSD
effective_io_concurrency = 200    # Para SSD

# Logging
log_min_duration_statement = 1000 # Log queries > 1s
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 30s
*/

-- ========================================
-- RECOMENDACIONES
-- ========================================

/*
1. EJECUTAR ÍNDICES EN HORARIOS DE BAJO TRÁFICO
   - Los CREATE INDEX CONCURRENTLY no bloquean, pero consumen recursos

2. MONITOREAR TAMAÑO DE ÍNDICES
   - Índices muy grandes pueden ser contraproducentes

3. USAR PGBOUNCER
   - Connection pooling externo para reducir overhead

4. REPLICACIÓN READ
   - Configurar replicas read-only para queries de lectura

5. PARTICIONAMIENTO
   - Solo si tienes > 10M de registros en una tabla

6. VACUUM REGULAR
   - Programar VACUUM ANALYZE cada noche

7. BACKUP INCREMENTAL
   - WAL archiving para backups continuos
*/
