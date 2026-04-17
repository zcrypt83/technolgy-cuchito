import express from 'express';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, changePassword } from '../controllers/usuarioController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, checkRole('administrador'), getUsuarios);
router.get('/:id', authMiddleware, getUsuarioById);
router.post('/', authMiddleware, checkRole('administrador'), createUsuario);
router.put('/:id', authMiddleware, checkRole('administrador'), updateUsuario);
router.delete('/:id', authMiddleware, checkRole('administrador'), deleteUsuario);
router.post('/:id/change-password', authMiddleware, changePassword);

export default router;
