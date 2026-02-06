import { Router } from 'express';
import { auth, authRole } from '../middleware/verifyToken.js';
import { CorteController } from '../controllers/corte.controller.js';
import { InventarioController } from '../controllers/inventario.controller.js';
const router = Router();
router.post('/', auth, authRole(['deshuesador', 'admin']), CorteController.registrarCortes);
router.put('/agregar-stock', auth, authRole(['admin', 'deshuesador']), InventarioController.agregarStock);

export default router;
