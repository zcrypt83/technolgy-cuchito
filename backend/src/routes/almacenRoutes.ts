import express from 'express';
import { getAlmacenes, getAlmacenById, createAlmacen, updateAlmacen, deleteAlmacen } from '../controllers/almacenController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getAlmacenes);
router.get('/:id', authMiddleware, getAlmacenById);
router.post('/', authMiddleware, checkRole('administrador'), createAlmacen);
router.put('/:id', authMiddleware, checkRole('administrador'), updateAlmacen);
router.delete('/:id', authMiddleware, checkRole('administrador'), deleteAlmacen);

export default router;
