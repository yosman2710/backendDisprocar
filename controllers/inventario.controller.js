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

    static async findAll(req, res) {
        try {
            const inventario = await inventarioService.findAll();
            res.json({
                success: true,
                message: 'Inventario encontrado',
                data: inventario
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getDetalles(req, res) {
        try {
            const { codigo } = req.params;
            const detalles = await inventarioService.findDetalles(codigo);
            res.json({
                success: true,
                data: detalles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
