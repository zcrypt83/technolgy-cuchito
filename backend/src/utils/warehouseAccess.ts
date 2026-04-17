import { Op } from 'sequelize';
import Almacen from '../models/Almacen';

export interface SessionUserContext {
  id: number;
  rol: string;
  almacenAsignadoId?: number | null;
}

export const getAccessibleWarehouseIds = async (
  usuario?: SessionUserContext
): Promise<number[] | null> => {
  if (!usuario) {
    return [];
  }

  if (usuario.rol === 'administrador') {
    return null;
  }

  const warehouseIds = new Set<number>();

  if (usuario.almacenAsignadoId) {
    warehouseIds.add(Number(usuario.almacenAsignadoId));
  }

  if (usuario.rol === 'encargado_almacen') {
    const almacenesEncargado = await Almacen.findAll({
      where: {
        estado: true,
        [Op.or]: [
          { encargadoId: usuario.id },
          ...(usuario.almacenAsignadoId ? [{ id: usuario.almacenAsignadoId }] : [])
        ]
      },
      attributes: ['id']
    });

    almacenesEncargado.forEach((almacen) => warehouseIds.add(almacen.id));
  }

  return Array.from(warehouseIds);
};

export const canAccessWarehouse = (
  warehouseId: number | string | null | undefined,
  accessibleWarehouseIds: number[] | null
): boolean => {
  if (accessibleWarehouseIds === null) {
    return true;
  }

  if (!warehouseId) {
    return false;
  }

  return accessibleWarehouseIds.includes(Number(warehouseId));
};
