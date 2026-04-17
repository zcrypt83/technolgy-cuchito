import express from 'express';
import {
  getInventario,
  getInventarioByProducto,
  updateInventario
} from '../controllers/inventarioController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getInventario);
router.get('/producto/:productoId', authMiddleware, getInventarioByProducto);
router.put('/:id', authMiddleware, checkRole('administrador', 'encargado_almacen'), updateInventario);

export default router;
