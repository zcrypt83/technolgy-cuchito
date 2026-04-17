import express from 'express';
import {
  getConfiguracionAdminPanel,
  getPermisosRolActual,
  updateAuditActions,
  updateRolePermissions
} from '../controllers/configuracionController';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/permisos-rol', authMiddleware, getPermisosRolActual);
router.get('/admin', authMiddleware, checkRole('administrador'), getConfiguracionAdminPanel);
router.put('/permisos', authMiddleware, checkRole('administrador'), updateRolePermissions);
router.put('/acciones-auditoria', authMiddleware, checkRole('administrador'), updateAuditActions);

export default router;

