#!/usr/bin/env node
/**
 * Script de Verificación Final
 * Verifica que todos los componentes necesarios estén instalados y configurados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, fn) {
  try {
    const result = fn();
    checks.push({ name, result: '✅', message: result });
    return true;
  } catch (error) {
    checks.push({ name, result: '❌', message: error.message });
    return false;
  }
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔍 VERIFICACIÓN FINAL DEL SISTEMA            ║');
console.log('║  Technology Cuchito V1.2.0                    ║');
console.log('╚════════════════════════════════════════════════╝\n');

// ============= VERIFICACIONES =============

console.log('🔧 Verificando requisitos...\n');

check('Node.js', () => {
  const version = execSync('node --version', { encoding: 'utf-8' }).trim();
  const major = parseInt(version.split('.')[0].slice(1));
  if (major < 18) throw new Error(`Node ${version} (se requiere 18+)`);
  return version;
});

check('npm', () => {
  const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
  return `npm ${version}`;
});

check('pnpm', () => {
  const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
  return `pnpm ${version}`;
});

check('PostgreSQL', () => {
  const version = execSync('psql --version', { encoding: 'utf-8' }).trim();
  return version;
});

// ============= ARCHIVOS =============

console.log('\n📁 Verificando archivos...\n');

check('backend/package.json', () => {
  if (!fs.existsSync('backend/package.json')) throw new Error('No existe');
  const pkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf-8'));
  return `${pkg.name} v${pkg.version}`;
});

check('frontend/package.json', () => {
  if (!fs.existsSync('frontend/package.json')) throw new Error('No existe');
  const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf-8'));
  return `${pkg.name} v${pkg.version}`;
});

check('backend/.env', () => {
  if (!fs.existsSync('backend/.env')) throw new Error('No existe (crear con setup-db.cjs)');
  return 'Configurado';
});

check('frontend/.env', () => {
  if (!fs.existsSync('frontend/.env')) throw new Error('No existe (crear con setup-db.cjs)');
  return 'Configurado';
});

// ============= DEPENDENCIAS =============

console.log('\n📦 Verificando dependencias de BD...\n');

check('pg instalado', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (!pkg.dependencies?.pg) throw new Error('pg no instalado');
  return `pg ${pkg.dependencies.pg}`;
});

check('backend/node_modules', () => {
  if (!fs.existsSync('backend/node_modules')) throw new Error('No instalado (ejecutar: pnpm install)');
  return 'Instalado';
});

check('frontend/node_modules', () => {
  if (!fs.existsSync('frontend/node_modules')) throw new Error('No instalado (ejecutar: pnpm install)');
  return 'Instalado';
});

// ============= CONFIGURACIÓN =============

console.log('\n⚙️  Verificando configuración...\n');

check('backend/src/config/config.ts', () => {
  const config = fs.readFileSync('backend/src/config/config.ts', 'utf-8');
  if (!config.includes('validateConfig')) throw new Error('validateConfig() no encontrado');
  if (!config.includes('max: 50')) throw new Error('Pool size no optimizado');
  return 'Config optimizada';
});

check('backend/src/server.ts', () => {
  const server = fs.readFileSync('backend/src/server.ts', 'utf-8');
  if (!server.includes('validateConfig()')) throw new Error('validateConfig() no se llama');
  if (!server.includes('performance')) throw new Error('Performance middleware no activado');
  return 'Middlewares activados';
});

// ============= RESULTADOS =============

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  📊 RESUMEN DE VERIFICACIÓN                    ║');
console.log('╚════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

checks.forEach(check => {
  console.log(`${check.result} ${check.name}`);
  if (check.message) {
    console.log(`   └─ ${check.message}`);
  }
  if (check.result === '✅') passed++;
  else failed++;
});

console.log(`\n${passed}/${passed + failed} verificaciones pasadas\n`);

// ============= RECOMENDACIONES =============

if (failed > 0) {
  console.log('⚠️  ACCIONES REQUERIDAS:\n');
  
  checks.forEach(check => {
    if (check.result === '❌') {
      console.log(`• ${check.name}: ${check.message}`);
    }
  });
  
  console.log('\n💡 Sugerencias:');
  console.log('  1. Ejecuta: pnpm install');
  console.log('  2. Instala PostgreSQL 15: https://www.postgresql.org/download/windows/');
  console.log('  3. Verifica contraseña postgres: admin123');
  console.log('  4. Ejecuta nuevamente: node verify.cjs\n');
  
  process.exit(1);
} else {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  🎉 SISTEMA LISTO PARA EJECUTAR               ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  console.log('📝 PRÓXIMOS PASOS:\n');
  console.log('  1. node setup-db.cjs    # Inicializar BD');
  console.log('  2. node start-all.cjs   # Iniciar Backend + Frontend\n');
  console.log('  O manualmente:\n');
  console.log('  Terminal 1: cd backend && pnpm exec tsx src/server.ts');
  console.log('  Terminal 2: cd frontend && pnpm dev\n');
  console.log('  Luego abre: http://localhost:5173\n');
  
  process.exit(0);
}
