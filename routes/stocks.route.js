import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();

router.get('/', auth, authRole(['admin', 'deshuesador']), InventarioController.findAll);

export default router;