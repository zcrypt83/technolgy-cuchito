import sequelize from '../../config/database';

const createTables = async () => {
  try {
    console.log('🔄 Iniciando creación de tablas...');
    const forceSync = process.env.DB_SYNC_FORCE === 'true';

    // Importar modelos para establecer relaciones
    await import('../../models/index');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({
      force: forceSync,
      alter: !forceSync
    });

    console.log('✅ Tablas creadas exitosamente');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

export default createTables;

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTables()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}
