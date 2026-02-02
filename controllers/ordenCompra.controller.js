import { OrdenCompraService } from '../services/ordenCompra.service.js';

const ordenCompraService = new OrdenCompraService();

export class OrdenCompraController {
    static async crearOrdenCompra(req, res) {
        try {
            const ordenData = req.body;
            const userId = req.user.id;
            console.log(userId);

            const result = await ordenCompraService.crearOrdenCompra(ordenData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarOrdenesCompra(req, res) {
        try {
            const result = await ordenCompraService.listarOrdenesCompra();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
