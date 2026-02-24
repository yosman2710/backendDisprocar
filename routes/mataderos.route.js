import express from "express";
import { MataderoController } from "../controllers/matadero.controller.js";
import { auth, authRole } from "../middleware/verifyToken.js";
const { crearMatadero, listarMataderos } = MataderoController;

const router = express.Router();

router.post('/', auth, authRole(['admin']), crearMatadero);

router.get('/', auth, authRole(['admin', 'registrador']), listarMataderos);

export default router;
