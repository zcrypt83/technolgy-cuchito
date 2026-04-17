import sequelize from '../../config/database';
import { Usuario } from '../../models/index';
import bcrypt from 'bcryptjs';

const seedSimple = async () => {
  try {
    console.log('🌱 [SEEDER] Iniciando seeding...');
    
    // 1. Sincronizar modelos
    console.log('🔄 [SEEDER] Sincronizando modelos con BD...');
    await sequelize.sync({ alter: true });
    console.log('✅ [SEEDER] Modelos sincronizados');

    // 2. Crear usuario admin
    console.log('👤 [SEEDER] Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const usuarioAdmin = await Usuario.create({
      nombre: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      rol: 'administrador',
      telefono: '+51 999 999 999',
      estado: true
    });
    
    console.log('✅ [SEEDER] Usuario admin creado:', usuarioAdmin.id);
    
    // 3. Resumen
    console.log(`
    ✅ SEEDING COMPLETADO
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Usuarios creados: 1
    Email: admin@test.com
    Contraseña: admin123
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

  } catch (error) {
    console.error('❌ [SEEDER] Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 [SEEDER] Conexión cerrada');
    process.exit(0);
  }
};

seedSimple();
