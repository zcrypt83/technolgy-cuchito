import sequelize from '../../config/database';

const runMigration = async () => {
  try {
    console.log('🔄 Agregando columna almacenAsignadoId a usuarios...');

    await sequelize.query(`
      ALTER TABLE "usuarios"
      ADD COLUMN IF NOT EXISTS "almacenAsignadoId" INTEGER NULL
      REFERENCES "almacenes"("id") ON DELETE SET NULL;
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_usuarios_almacen_asignado_id"
      ON "usuarios"("almacenAsignadoId");
    `);

    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_encargado_por_almacen"
      ON "usuarios"("almacenAsignadoId")
      WHERE "rol" = 'encargado_almacen'
        AND "estado" = TRUE
        AND "almacenAsignadoId" IS NOT NULL;
    `);

    await sequelize.query(`
      UPDATE "usuarios" u
      SET "almacenAsignadoId" = a."id"
      FROM "almacenes" a
      WHERE a."encargadoId" = u."id"
        AND u."rol" = 'encargado_almacen'
        AND u."almacenAsignadoId" IS NULL;
    `);

    await sequelize.query(`
      UPDATE "almacenes" a
      SET "encargadoId" = NULL
      FROM "usuarios" u
      WHERE a."encargadoId" = u."id"
        AND u."rol" = 'encargado_almacen'
        AND u."almacenAsignadoId" IS NOT NULL
        AND a."id" <> u."almacenAsignadoId";
    `);

    await sequelize.query(`
      UPDATE "usuarios" u
      SET "almacenAsignadoId" = sub."id"
      FROM (
        SELECT "id"
        FROM "almacenes"
        WHERE "estado" = TRUE
        ORDER BY "id" ASC
        LIMIT 1
      ) AS sub
      WHERE u."rol" = 'usuario_operativo'
        AND u."almacenAsignadoId" IS NULL;
    `);

    console.log('✅ Migración aplicada correctamente');
  } catch (error) {
    console.error('❌ Error aplicando migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
