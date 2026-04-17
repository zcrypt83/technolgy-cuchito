import express from 'express';
import { getAuditorias, getAuditoriasByUsuario, getAuditoriasByEntidad } from '../controllers/auditoriaController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, checkRole('administrador'), getAuditorias);
router.get('/usuario/:usuarioId', authMiddleware, checkRole('administrador'), getAuditoriasByUsuario);
router.get('/entidad/:entidad/:entidadId', authMiddleware, checkRole('administrador'), getAuditoriasByEntidad);

export default router;
