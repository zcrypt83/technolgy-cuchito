#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const ok = (message) => {
  log(`  OK ${message}`, 'green');
  checks.passed += 1;
};

const fail = (message) => {
  log(`  FAIL ${message}`, 'red');
  checks.failed += 1;
};

const warn = (message) => {
  log(`  WARN ${message}`, 'yellow');
  checks.warnings += 1;
};

const checkFileExists = (filepath, label) => {
  if (fs.existsSync(filepath)) {
    ok(`${label} existe`);
    return true;
  }
  fail(`${label} no existe en ${filepath}`);
  return false;
};

const checkEnvVariable = (filepath, variableName, expectedPrefix = null) => {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const regex = new RegExp(`^${variableName}=(.+)$`, 'm');
    const match = content.match(regex);

    if (!match) {
      warn(`${variableName} no esta en ${path.basename(filepath)}`);
      return false;
    }

    const value = match[1];
    if (expectedPrefix && !value.startsWith(expectedPrefix)) {
      warn(`${variableName} no comienza con ${expectedPrefix}`);
      return false;
    }

    if (value === 'default-secret-change-in-production') {
      fail(`${variableName} usa el valor por defecto (inseguro)`);
      return false;
    }

    ok(`${variableName} esta configurado correctamente`);
    return true;
  } catch {
    fail(`Error leyendo ${filepath}`);
    return false;
  }
};

const checkCodeExists = (filepath, searchString, featureName) => {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    if (content.includes(searchString)) {
      ok(`${featureName} esta implementado`);
      return true;
    }
    fail(`${featureName} no esta implementado`);
    return false;
  } catch {
    fail(`Error leyendo ${filepath}`);
    return false;
  }
};

log('\n=== VERIFICACION DE PRODUCTION READINESS ===\n', 'blue');

const backendEnv = path.join(__dirname, 'backend', '.env');
const backendEnvExample = path.join(__dirname, 'backend', '.env.example');
const frontendEnv = path.join(__dirname, 'frontend', '.env');
const frontendEnvExample = path.join(__dirname, 'frontend', '.env.example');
const backendConfig = path.join(__dirname, 'backend', 'src', 'config', 'config.ts');
const serverFile = path.join(__dirname, 'backend', 'src', 'server.ts');

log('1) Verificando archivos base...', 'blue');
checkFileExists(backendEnv, 'backend/.env');
checkFileExists(backendEnvExample, 'backend/.env.example');
checkFileExists(frontendEnv, 'frontend/.env');
checkFileExists(frontendEnvExample, 'frontend/.env.example');

log('\n2) Verificando variables criticas...', 'blue');
if (fs.existsSync(backendEnv)) {
  checkEnvVariable(backendEnv, 'JWT_SECRET');
  checkEnvVariable(backendEnv, 'REDIS_HOST');
  checkEnvVariable(backendEnv, 'REDIS_PORT');
}
if (fs.existsSync(frontendEnv)) {
  checkEnvVariable(frontendEnv, 'VITE_API_URL', 'http');
}

log('\n3) Verificando codigo critico...', 'blue');
if (checkFileExists(backendConfig, 'backend/src/config/config.ts')) {
  checkCodeExists(backendConfig, 'validateConfig', 'validateConfig()');
  checkCodeExists(backendConfig, 'max: 50', 'pool DB max=50');
  checkCodeExists(backendConfig, 'redis:', 'config Redis');
}
if (checkFileExists(serverFile, 'backend/src/server.ts')) {
  checkCodeExists(serverFile, 'connectRedis', 'conexion Redis');
  checkCodeExists(serverFile, 'responseTimeMiddleware', 'responseTime middleware');
  checkCodeExists(serverFile, 'securityHeadersMiddleware', 'security headers middleware');
  checkCodeExists(serverFile, 'etagMiddleware', 'etag middleware');
  checkCodeExists(serverFile, 'requestTimeout', 'request timeout middleware');
}

log('\n=== RESULTADOS ===', 'blue');
log(`OK: ${checks.passed}`, 'green');
log(`FAIL: ${checks.failed}`, 'red');
log(`WARN: ${checks.warnings}`, 'yellow');

if (checks.failed > 0) {
  process.exit(1);
}

process.exit(0);
