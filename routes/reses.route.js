import { Router } from 'express';
import { ResesController } from '../controllers/reses.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';
import { CorteController } from '../controllers/corte.controller.js';

const router = Router();
const { crearReses, listarReses, listarResesPorTicket } = ResesController;
const { marcarDesguazada } = CorteController;

router.post('/', auth, authRole(['admin', 'pesador_caliente']), crearReses);

router.get('/', auth, authRole(['admin', 'pesador_caliente', 'pesador_frio', 'deshuesador']), listarReses);

router.get('/by-order/:orden_id', auth, authRole(['admin', 'registrador', 'pesador_caliente', 'pesador_frio', 'deshuesador']), listarResesPorTicket);

router.put('/desguazar', auth, authRole(['deshuesador', 'admin', 'pesador_frio']), marcarDesguazada);


export default router;