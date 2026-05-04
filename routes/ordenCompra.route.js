import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';

const router = Router();
const {
    crearOrdenCompra, listarOrdenesCompra,
    listarOrdenesPendientesRecepcion, listarOrdenesPendientesCorte,
    listarOrdenesPorProveedor, listarOrdenesPorMatadero,
    resumenPorProveedor, resumenPorMatadero,
    obtenerOrdenPorId, actualizarEstadoOrden,
    actualizarOrden, eliminarOrden
} = OrdenCompraController;

// Recepción / Corte stations
router.get('/pendientes-recepcion', auth, authRole(['admin', 'pesador_caliente']), listarOrdenesPendientesRecepcion);
router.get('/pendientes-corte',     auth, authRole(['admin', 'deshuesador']),      listarOrdenesPendientesCorte);

// CRUD principal
router.post('/',    auth, authRole(['admin', 'registrador']), crearOrdenCompra);
router.get('/',     auth, authRole(['admin', 'registrador']), listarOrdenesCompra);
router.get('/:id',  auth, authRole(['admin', 'registrador', 'pesador_caliente', 'deshuesador']), obtenerOrdenPorId);
router.put('/:id',  auth, authRole(['admin', 'registrador']), actualizarOrden);
router.delete('/:id', auth, authRole(['admin']), eliminarOrden);
router.patch('/:id/estado', auth, authRole(['admin', 'registrador']), actualizarEstadoOrden);

// Filtros
router.get('/proveedor/:proveedor_id', auth, authRole(['admin', 'registrador']), listarOrdenesPorProveedor);
router.get('/matadero/:matadero_id',   auth, authRole(['admin', 'registrador']), listarOrdenesPorMatadero);

// Resúmenes
router.get('/resumen/proveedor', auth, authRole(['admin', 'registrador']), resumenPorProveedor);
router.get('/resumen/matadero',  auth, authRole(['admin', 'registrador']), resumenPorMatadero);

export default router;