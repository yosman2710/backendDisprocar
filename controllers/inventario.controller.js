import { InventarioService } from '../services/inventario.service.js';

const inventarioService = new InventarioService();

export class InventarioController {
    static async agregarStock(req, res) {
        try {
            const corteIds = req.body.corteIds;
            const result = await inventarioService.agregarStockDesdeCortes(corteIds);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
