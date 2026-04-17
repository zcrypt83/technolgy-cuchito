import { Sequelize } from 'sequelize';
import { config } from './config';

const commonOptions = {
  dialect: config.database.dialect,
  logging: config.database.logging,
  pool: config.database.pool,
  dialectOptions: config.database.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : undefined
};

const sequelize = config.database.url
  ? new Sequelize(config.database.url, commonOptions)
  : new Sequelize(config.database.name, config.database.user, config.database.password, {
      host: config.database.host,
      port: config.database.port as number,
      ...commonOptions
    });

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    return false;
  }
};

export default sequelize;
