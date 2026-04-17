import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Movimiento from '../models/Movimiento';
import Producto from '../models/Producto';
import Almacen from '../models/Almacen';
import Usuario from '../models/Usuario';
import Inventario from '../models/Inventario';
import { AppError } from '../middleware/errorHandler';
import sequelize from '../config/database';
import { canAccessWarehouse, getAccessibleWarehouseIds } from '../utils/warehouseAccess';
import { registrarAuditoria } from '../services/auditoriaService';

export const getMovimientos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, almacenId, fechaInicio, fechaFin, page = 1, limit = 50 } = req.query;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);
    const conditions: any[] = [];

    if (tipo) {
      conditions.push({ tipo });
    }

    if (fechaInicio && fechaFin) {
      conditions.push({
        fecha: {
          [Op.between]: [new Date(fechaInicio as string), new Date(fechaFin as string)]
        }
      });
    }

    if (almacenId) {
      if (!canAccessWarehouse(almacenId as string, accessibleWarehouseIds)) {
        throw new AppError('No tienes permisos para consultar ese almacén', 403);
      }

      conditions.push({
        [Op.or]: [{ almacenOrigenId: almacenId }, { almacenDestinoId: almacenId }]
      });
    }

    if (accessibleWarehouseIds !== null) {
      if (!accessibleWarehouseIds.length) {
        res.json({
          movimientos: [],
          total: 0,
          page: Number(page),
          totalPages: 0
        });
        return;
      }

      conditions.push({
        [Op.or]: [
          { almacenOrigenId: { [Op.in]: accessibleWarehouseIds } },
          { almacenDestinoId: { [Op.in]: accessibleWarehouseIds } }
        ]
      });
    }

    const where = conditions.length ? { [Op.and]: conditions } : {};
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: movimientos } = await Movimiento.findAndCountAll({
      where,
      include: [
        { model: Producto, as: 'producto' },
        { model: Almacen, as: 'almacenOrigen' },
        { model: Almacen, as: 'almacenDestino' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }
      ],
      limit: Number(limit),
      offset,
      order: [['fecha', 'DESC']]
    });

    res.json({
      movimientos,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  }
};

export const createMovimiento = async (req: any, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const {
      tipo,
      productoId,
      almacenOrigenId,
      almacenDestinoId,
      cantidad,
      motivo,
      numeroDocumento
    } = req.body;

    const tipoNormalizado = String(tipo || '').toLowerCase() as
      | 'entrada'
      | 'salida'
      | 'transferencia'
      | 'ajuste';
    const rolNormalizado = String(req.usuario?.rol || '').toLowerCase();
    const accessibleWarehouseIds = await getAccessibleWarehouseIds(req.usuario);
    const productoIdNum = Number(productoId);
    const cantidadNum = Number(cantidad);
    const almacenOrigenIdNum = almacenOrigenId === undefined || almacenOrigenId === null || almacenOrigenId === ''
      ? null
      : Number(almacenOrigenId);
    const almacenDestinoIdNum = almacenDestinoId === undefined || almacenDestinoId === null || almacenDestinoId === ''
      ? null
      : Number(almacenDestinoId);
    const motivoNormalizado = String(motivo ?? '').trim();
    const numeroDocumentoNormalizado =
      numeroDocumento === undefined || numeroDocumento === null || String(numeroDocumento).trim() === ''
        ? null
        : String(numeroDocumento).trim();

    const permisosPorRol: Record<string, string[]> = {
      administrador: ['entrada', 'salida', 'transferencia', 'ajuste'],
      encargado_almacen: ['entrada', 'salida', 'transferencia', 'ajuste'],
      usuario_operativo: ['salida']
    };

    if (!tipo || !motivoNormalizado) {
      throw new AppError('Datos incompletos', 400);
    }

    if (!['entrada', 'salida', 'transferencia', 'ajuste'].includes(tipoNormalizado)) {
      throw new AppError('Tipo de movimiento inválido', 400);
    }

    if (!Number.isInteger(productoIdNum) || productoIdNum < 1) {
      throw new AppError('Producto inválido', 400);
    }

    if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
      throw new AppError('La cantidad debe ser mayor o igual a 1', 400);
    }

    if (almacenOrigenIdNum !== null && (!Number.isInteger(almacenOrigenIdNum) || almacenOrigenIdNum < 1)) {
      throw new AppError('Almacén origen inválido', 400);
    }

    if (almacenDestinoIdNum !== null && (!Number.isInteger(almacenDestinoIdNum) || almacenDestinoIdNum < 1)) {
      throw new AppError('Almacén destino inválido', 400);
    }

    if (!permisosPorRol[rolNormalizado]?.includes(tipoNormalizado)) {
      throw new AppError('No tienes permisos para registrar este tipo de movimiento', 403);
    }

    if (tipoNormalizado === 'entrada' && !almacenDestinoIdNum) {
      throw new AppError('La entrada requiere almacén destino', 400);
    }

    if (tipoNormalizado === 'salida' && !almacenOrigenIdNum && !almacenDestinoIdNum) {
      throw new AppError('La salida requiere almacén origen o destino', 400);
    }

    if (tipoNormalizado === 'transferencia') {
      if (!almacenOrigenIdNum || !almacenDestinoIdNum) {
        throw new AppError('La transferencia requiere almacén origen y destino', 400);
      }
      if (almacenOrigenIdNum === almacenDestinoIdNum) {
        throw new AppError('El almacén origen y destino deben ser diferentes', 400);
      }
    }

    const involvedWarehouseIds = [
      almacenOrigenIdNum,
      almacenDestinoIdNum
    ].filter(Boolean) as number[];

    if (
      accessibleWarehouseIds !== null &&
      involvedWarehouseIds.some((warehouseId) => !accessibleWarehouseIds.includes(warehouseId))
    ) {
      throw new AppError('No tienes permisos para registrar movimientos en ese almacén', 403);
    }

    const movimiento = await Movimiento.create(
      {
        tipo: tipoNormalizado,
        productoId: productoIdNum,
        almacenOrigenId: almacenOrigenIdNum ?? undefined,
        almacenDestinoId: almacenDestinoIdNum ?? undefined,
        cantidad: cantidadNum,
        motivo: motivoNormalizado,
        usuarioId: req.usuario.id,
        numeroDocumento: numeroDocumentoNormalizado ?? undefined,
        fecha: new Date()
      },
      { transaction }
    );

    if (tipoNormalizado === 'entrada') {
      const inventario = await Inventario.findOne({
        where: { productoId: productoIdNum, almacenId: almacenDestinoIdNum! },
        transaction
      });

      if (inventario) {
        await inventario.update(
          {
            cantidad: inventario.cantidad + cantidadNum,
            ultimaActualizacion: new Date()
          },
          { transaction }
        );
      } else {
        await Inventario.create(
          {
            productoId: productoIdNum,
            almacenId: almacenDestinoIdNum!,
            cantidad: cantidadNum,
            ultimaActualizacion: new Date()
          },
          { transaction }
        );
      }
    } else if (tipoNormalizado === 'salida') {
      const almacenSalidaId = almacenOrigenIdNum || almacenDestinoIdNum;
      const inventario = await Inventario.findOne({
        where: { productoId: productoIdNum, almacenId: almacenSalidaId! },
        transaction
      });

      if (!inventario || inventario.cantidad < cantidadNum) {
        throw new AppError('Stock insuficiente', 400);
      }

      await inventario.update(
        {
          cantidad: inventario.cantidad - cantidadNum,
          ultimaActualizacion: new Date()
        },
        { transaction }
      );
    } else if (tipoNormalizado === 'transferencia') {
      const inventarioOrigen = await Inventario.findOne({
        where: { productoId: productoIdNum, almacenId: almacenOrigenIdNum! },
        transaction
      });

      if (!inventarioOrigen || inventarioOrigen.cantidad < cantidadNum) {
        throw new AppError('Stock insuficiente en almacén origen', 400);
      }

      await inventarioOrigen.update(
        {
          cantidad: inventarioOrigen.cantidad - cantidadNum,
          ultimaActualizacion: new Date()
        },
        { transaction }
      );

      const inventarioDestino = await Inventario.findOne({
        where: { productoId: productoIdNum, almacenId: almacenDestinoIdNum! },
        transaction
      });

      if (inventarioDestino) {
        await inventarioDestino.update(
          {
            cantidad: inventarioDestino.cantidad + cantidadNum,
            ultimaActualizacion: new Date()
          },
          { transaction }
        );
      } else {
        await Inventario.create(
          {
            productoId: productoIdNum,
            almacenId: almacenDestinoIdNum!,
            cantidad: cantidadNum,
            ultimaActualizacion: new Date()
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    await registrarAuditoria({
      req,
      accion: 'CREAR_MOVIMIENTO',
      entidad: 'movimientos',
      entidadId: movimiento.id,
      detalles: `Movimiento ${tipoNormalizado} registrado para producto ${productoIdNum}, cantidad ${cantidadNum}`
    });

    const movimientoCompleto = await Movimiento.findByPk(movimiento.id, {
      include: [
        { model: Producto, as: 'producto' },
        { model: Almacen, as: 'almacenOrigen' },
        { model: Almacen, as: 'almacenDestino' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }
      ]
    });

    res.status(201).json(movimientoCompleto);
  } catch (error: any) {
    if (!(transaction as any).finished) {
      await transaction.rollback();
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (
      error?.name === 'SequelizeForeignKeyConstraintError' ||
      error?.name === 'SequelizeValidationError' ||
      error?.name === 'SequelizeDatabaseError'
    ) {
      res.status(400).json({ error: 'Datos inválidos para registrar el movimiento' });
    } else {
      res.status(500).json({ error: 'Error al crear movimiento' });
    }

    console.error('❌ Error al crear movimiento:', {
      name: error?.name,
      message: error?.message,
      original: error?.original?.message,
      sql: error?.sql
    });
  }
};
