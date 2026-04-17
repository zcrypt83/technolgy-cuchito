#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('\n=== VERIFICACION DE CONFIGURACION FASE 1 ===\n');

const checks = {
  passed: 0,
  failed: 0
};

function check(condition, message) {
  if (condition) {
    console.log('[OK] ' + message);
    checks.passed++;
  } else {
    console.log('[FAIL] ' + message);
    checks.failed++;
  }
}

// 1. Verificar archivos .env
const backendEnv = path.join(__dirname, 'backend', '.env');
const frontendEnv = path.join(__dirname, 'frontend', '.env');
const backendConfig = path.join(__dirname, 'backend', 'src', 'config', 'config.ts');
const serverFile = path.join(__dirname, 'backend', 'src', 'server.ts');

check(fs.existsSync(backendEnv), 'backend/.env existe');
check(fs.existsSync(frontendEnv), 'frontend/.env existe');

// 2. Verificar JWT_SECRET en backend/.env
if (fs.existsSync(backendEnv)) {
  const content = fs.readFileSync(backendEnv, 'utf8');
  const hasJWT = content.includes('JWT_SECRET=');
  const notDefault = !content.includes('default-secret-change-in-production');
  check(hasJWT, 'JWT_SECRET configurado en backend/.env');
  check(notDefault, 'JWT_SECRET no usa valor por defecto (inseguro)');
}

// 3. Verificar Redis en backend/.env
if (fs.existsSync(backendEnv)) {
  const content = fs.readFileSync(backendEnv, 'utf8');
  check(content.includes('REDIS_HOST='), 'REDIS_HOST configurado');
  check(content.includes('REDIS_PORT='), 'REDIS_PORT configurado');
}

// 4. Verificar config.ts
if (fs.existsSync(backendConfig)) {
  const content = fs.readFileSync(backendConfig, 'utf8');
  check(content.includes('max: 50'), 'Pool DB max: 50 configurado');
  check(content.includes('min: 10'), 'Pool DB min: 10 configurado');
  check(content.includes('redis:'), 'Redis config en config.ts');
  check(content.includes('validateConfig'), 'validateConfig function existe');
}

// 5. Verificar server.ts
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  check(content.includes('connectRedis'), 'connectRedis importado en server.ts');
  check(content.includes('responseTimeMiddleware'), 'responseTimeMiddleware activo');
  check(content.includes('securityHeadersMiddleware'), 'securityHeadersMiddleware activo');
  check(content.includes('etagMiddleware'), 'etagMiddleware activo');
  check(content.includes('requestTimeout'), 'requestTimeout activo');
  check(content.includes('validateConfig()'), 'validateConfig() llamado en startup');
}

// 6. Verificar frontend/.env
if (fs.existsSync(frontendEnv)) {
  const content = fs.readFileSync(frontendEnv, 'utf8');
  check(content.includes('VITE_API_URL='), 'VITE_API_URL configurado');
  check(content.includes('http://localhost:5000'), 'API URL apunta a localhost:5000');
}

console.log('\n=== RESULTADOS ===');
console.log('[TOTAL] Pasadas: ' + checks.passed);
console.log('[TOTAL] Fallidas: ' + checks.failed);

if (checks.failed === 0) {
  console.log('\nSUCESO: Todas las verificaciones pasaron!');
  console.log('FASE 1 completada correctamente.\n');
  process.exit(0);
} else {
  console.log('\nERROR: Hay verificaciones que fallaron.\n');
  process.exit(1);
}
