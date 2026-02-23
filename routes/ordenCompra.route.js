import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';
import { MataderoController } from '../controllers/matadero.controller.js';
import { ProveedorController } from '../controllers/proveedor.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();
const { crearOrdenCompra, listarOrdenesCompra, listarOrdenesPendientesPesoCaliente, listarOrdenesPendientesPesoFrio, listarOrdenesPendientesDeshuese } = OrdenCompraController;
const { crearMatadero, listarMataderos } = MataderoController;
const { crearProveedor, listarProveedores } = ProveedorController;

router.get('/pendientes-caliente', auth, authRole(['admin', 'pesador_caliente']), listarOrdenesPendientesPesoCaliente);
router.get('/pendientes-frio', auth, authRole(['admin', 'pesador_frio']), listarOrdenesPendientesPesoFrio);
router.get('/pendientes-deshuese', auth, authRole(['admin', 'deshuesador']), listarOrdenesPendientesDeshuese);

router.post('/', auth, authRole(['admin', 'registrador']), crearOrdenCompra);

router.post('/matadero', auth, authRole(['admin']), crearMatadero);

router.get('/matadero', auth, authRole(['admin', 'registrador']), listarMataderos);

router.post('/proveedor', auth, authRole(['admin']), crearProveedor);

router.get('/proveedor', auth, authRole(['admin', 'registrador']), listarProveedores);

router.get('/', auth, authRole(['admin', 'registrador']), listarOrdenesCompra);



export default router;