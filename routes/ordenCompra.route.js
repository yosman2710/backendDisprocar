import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';
import { MataderoController } from '../controllers/matadero.controller.js';
import { ProveedorController } from '../controllers/proveedor.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();
const { crearOrdenCompra, listarOrdenesCompra } = OrdenCompraController;
const { crearMatadero, listarMataderos } = MataderoController;
const { crearProveedor, listarProveedores } = ProveedorController;

router.post('/', auth, authRole(['admin']), crearOrdenCompra);

router.post('/matadero', auth, authRole(['admin']), crearMatadero);

router.get('/matadero', auth, authRole(['admin']), listarMataderos);

router.post('/proveedor', auth, authRole(['admin']), crearProveedor);

router.get('/proveedor', auth, authRole(['admin']), listarProveedores);

router.get('/', auth, authRole(['admin']), listarOrdenesCompra);



export default router;