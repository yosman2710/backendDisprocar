import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller.js';
import { auth, authRole } from '../middleware/verifyToken.js';
import pool from '../db.js';

const router = Router();

router.get('/test-schema', async (req, res) => {
    try {
        const result = await pool.query("SELECT pg_get_viewdef('inventario') AS view_def");
        res.json({ success: true, view_def: result.rows });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

router.get('/', auth, authRole(['admin', 'deshuesador']), InventarioController.findAll);
router.get('/:codigo/detalles', auth, authRole(['admin', 'deshuesador']), InventarioController.getDetalles);

export default router;