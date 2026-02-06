import { Router } from 'express';
import { ResesController } from '../controllers/reses.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';
import { CorteController } from '../controllers/corte.controller.js';
import { InventarioController } from '../controllers/inventario.controller.js';

const router = Router();
const { crearReses, listarReses, addPesoFrio, updateEstado } = ResesController;

router.post('/', auth, authRole(['admin', 'pesador_caliente']), crearReses);

router.get('/', auth, authRole(['admin', 'pesador_caliente', 'pesador_frio']), listarReses);

router.put('/addPesoFrio', auth, authRole(['admin', 'pesador_frio']), addPesoFrio);

router.put('/updateEstado', auth, authRole(['admin', 'pesador_caliente', 'pesador_frio']), updateEstado);

router.get('/tipos-corte',
    auth,
    authRole(['deshuesador', 'admin']),
    CorteController.listarTiposCorte.bind(CorteController)
);

router.post('/reses/:resId/desguazar',
    auth,
    authRole(['deshuesador']),
    CorteController.marcarDesguazada.bind(CorteController)
);

router.post('/reses/:resId/cortes',
    auth,
    authRole(['deshuesador']),
    CorteController.registrarCortes.bind(CorteController)
);

router.post('/inventario/agregar-stock', auth, authRole(['admin', 'deshuesador']), InventarioController.agregarStock.bind(InventarioController));

export default router;