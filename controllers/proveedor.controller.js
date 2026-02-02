import { ProveedorService } from '../services/proveedor.service.js';

const proveedorService = new ProveedorService();

export class ProveedorController {
    static async crearProveedor(req, res) {
        try {
            const result = await proveedorService.crearProveedor(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarProveedores(req, res) {
        try {
            const result = await proveedorService.listarProveedores();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
