import { Router } from 'express';
import { ResesController } from '../controllers/reses.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';
import { CorteController } from '../controllers/corte.controller.js';
import { InventarioController } from '../controllers/inventario.controller.js';

const router = Router();
const { crearReses, listarReses, addPesoFrio, marcarCongelado } = ResesController;
const { marcarDesguazada, registrarCortes, listarTiposCorte } = CorteController;

router.post('/', auth, authRole(['admin', 'pesador_caliente']), crearReses);

router.get('/', auth, authRole(['admin', 'pesador_caliente', 'pesador_frio', 'deshuesador']), listarReses);

router.put('/congelar', auth, authRole(['admin', 'pesador_caliente']), marcarCongelado);

router.put('/addPesoFrio', auth, authRole(['admin', 'pesador_frio']), addPesoFrio);

router.put('/desguazar', auth, authRole(['deshuesador', 'admin']), marcarDesguazada);


export default router;