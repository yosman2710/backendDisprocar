import { OrdenCompraService } from '../services/ordenCompra.service.js';

const ordenCompraService = new OrdenCompraService();

export class OrdenCompraController {
    static async crearOrdenCompra(req, res) {
        try {
            const ordenData = req.body;
            const userId = req.user.id;

            const result = await ordenCompraService.crearOrdenCompra(ordenData, userId);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
