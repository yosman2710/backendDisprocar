import { Router } from 'express';
import { OrdenCompraController } from '../controllers/ordenCompra.controller.js';

const router = Router();
const { crearOrdenCompra } = OrdenCompraController;

router.post('/', crearOrdenCompra);

export default router;