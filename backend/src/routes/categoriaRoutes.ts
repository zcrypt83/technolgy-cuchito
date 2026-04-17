import express from 'express';
import { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getCategorias);
router.get('/:id', authMiddleware, getCategoriaById);
router.post('/', authMiddleware, checkRole('administrador', 'encargado_almacen'), createCategoria);
router.put('/:id', authMiddleware, checkRole('administrador', 'encargado_almacen'), updateCategoria);
router.delete('/:id', authMiddleware, checkRole('administrador'), deleteCategoria);

export default router;
