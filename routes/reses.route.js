import { Router } from 'express';
import { ResesController } from '../controllers/reses.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();
const { crearReses, listarReses, addPesoFrio } = ResesController;

router.post('/', auth, authRole(['admin', 'pesador_caliente']), crearReses);

router.get('/', auth, authRole(['admin', 'pesador_caliente', 'pesador_frio']), listarReses);

router.put('/addPesoFrio', auth, authRole(['admin', 'pesador_frio']), addPesoFrio);

export default router;