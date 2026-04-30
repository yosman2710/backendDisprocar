import { OrdenCompraService } from '../services/ordenCompra.service.js';

const ordenCompraService = new OrdenCompraService();

export class OrdenCompraController {
    static async crearOrdenCompra(req, res) {
        try {
            const ordenData = req.body;

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

    static async resumenPorProveedor(req, res) {
        try {
            const result = await ordenCompraService.resumenPorProveedor();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async resumenPorMatadero(req, res) {
        try {
            const result = await ordenCompraService.resumenPorMatadero();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarOrdenesPorProveedor(req, res) {
        try {
            const { proveedor_id } = req.params;
            const result = await ordenCompraService.listarOrdenesPorProveedor(proveedor_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarOrdenesPorMatadero(req, res) {
        try {
            const { matadero_id } = req.params;
            const result = await ordenCompraService.listarOrdenesPorMatadero(matadero_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarOrdenesPendientesRecepcion(req, res) {
        try {
            const result = await ordenCompraService.listarOrdenesPendientesRecepcion();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarOrdenesPendientesCorte(req, res) {
        try {
            const result = await ordenCompraService.listarOrdenesPendientesCorte();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
