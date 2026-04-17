/**
 * Configuración de variables de entorno
 * Valida que las variables requeridas estén presentes
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    throw new Error(
      `Variable de entorno requerida no encontrada: ${key}\n` +
      `Asegúrate de crear un archivo .env en /frontend/ basado en .env.example`
    );
  }

  return value;
};

// Validar variables de entorno al cargar el módulo
const validateEnv = () => {
  const required = ['VITE_API_URL'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error(
      '❌ Variables de entorno faltantes:\n' +
      missing.map(key => `  - ${key}`).join('\n') +
      '\n\n📝 Crea un archivo .env en /frontend/ con:\n' +
      'VITE_API_URL=http://localhost:5000/api'
    );
  }
};

validateEnv();

export const env = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:5000/api'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Technology Cuchito'),
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',
};

// Log de configuración en desarrollo
if (env.isDevelopment) {
  console.log('🔧 Configuración de entorno:', {
    API_URL: env.API_URL,
    APP_NAME: env.APP_NAME,
    NODE_ENV: env.NODE_ENV,
  });
}
