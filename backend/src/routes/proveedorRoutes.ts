import express from 'express';
import { getProveedores, getProveedorById, createProveedor, updateProveedor, deleteProveedor } from '../controllers/proveedorController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getProveedores);
router.get('/:id', authMiddleware, getProveedorById);
router.post('/', authMiddleware, checkRole('administrador', 'encargado_almacen'), createProveedor);
router.put('/:id', authMiddleware, checkRole('administrador', 'encargado_almacen'), updateProveedor);
router.delete('/:id', authMiddleware, checkRole('administrador'), deleteProveedor);

export default router;
