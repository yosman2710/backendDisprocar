import express from "express";
import { ProveedorController } from '../controllers/proveedor.controller.js';;
import { auth, authRole } from '../middleware/verifyToken.js';
const { crearProveedor, listarProveedores } = ProveedorController;

const router = express.Router();

router.post('/', auth, authRole(['admin']), crearProveedor);

router.get('/', auth, authRole(['admin', 'registrador']), listarProveedores);;

export default router;