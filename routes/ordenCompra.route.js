import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';
import { MataderoController } from '../controllers/matadero.controller.js';
import { ProveedorController } from '../controllers/proveedor.controller.js';

const router = Router();
const { crearOrdenCompra } = OrdenCompraController;
const { crearMatadero } = MataderoController;
const { crearProveedor } = ProveedorController;

router.post('/', crearOrdenCompra);

router.post('/matadero', crearMatadero);

router.post('/proveedor', crearProveedor);

export default router;