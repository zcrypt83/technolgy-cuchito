import express from 'express';
import { getMovimientos, createMovimiento } from '../controllers/movimientoController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getMovimientos);
router.post('/', authMiddleware, checkRole('administrador', 'encargado_almacen', 'usuario_operativo'), createMovimiento);

export default router;
