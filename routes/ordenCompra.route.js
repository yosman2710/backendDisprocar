import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();
const { crearOrdenCompra, listarOrdenesCompra, listarOrdenesPendientesPesoCaliente, listarOrdenesPendientesPesoFrio, listarOrdenesPendientesDeshuese, listarOrdenesPorProveedor, listarOrdenesPorMatadero, resumenPorProveedor, resumenPorMatadero } = OrdenCompraController;


router.get('/pendientes-caliente', auth, authRole(['admin', 'pesador_caliente']), listarOrdenesPendientesPesoCaliente);
router.get('/pendientes-frio', auth, authRole(['admin', 'pesador_frio']), listarOrdenesPendientesPesoFrio);
router.get('/pendientes-deshuese', auth, authRole(['admin', 'deshuesador']), listarOrdenesPendientesDeshuese);

router.post('/', auth, authRole(['admin', 'registrador']), crearOrdenCompra);
router.get('/', auth, authRole(['admin', 'registrador']), listarOrdenesCompra);
router.get('/proveedor/:proveedor_id', auth, authRole(['admin', 'registrador']), listarOrdenesPorProveedor);
router.get('/matadero/:matadero_id', auth, authRole(['admin', 'registrador']), listarOrdenesPorMatadero);
router.get('/resumen/proveedor', auth, authRole(['admin', 'registrador']), resumenPorProveedor);
router.get('/resumen/matadero', auth, authRole(['admin', 'registrador']), resumenPorMatadero);



export default router;