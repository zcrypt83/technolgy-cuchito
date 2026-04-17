import express from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productoController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getProductos);
router.get('/:id', authMiddleware, getProductoById);
router.post('/', authMiddleware, checkRole('administrador', 'encargado_almacen'), createProducto);
router.put('/:id', authMiddleware, checkRole('administrador', 'encargado_almacen'), updateProducto);
router.delete('/:id', authMiddleware, checkRole('administrador'), deleteProducto);

export default router;
