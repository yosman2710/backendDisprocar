import { Router } from 'express';
import { auth, authRole } from '../middleware/verifyToken.js';
import { CorteController } from '../controllers/corte.controller.js';
const router = Router();
router.get('/', auth, authRole(['deshuesador', 'admin']), CorteController.listarTiposCorte);
router.post('/', auth, authRole(['deshuesador', 'admin']), CorteController.crearTipoCorte);
export default router;  
