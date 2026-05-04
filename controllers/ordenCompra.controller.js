import { OrdenCompraService } from '../services/ordenCompra.service.js';

const ordenCompraService = new OrdenCompraService();

export class OrdenCompraController {

    static async crearOrdenCompra(req, res) {
        try {
            const result = await ordenCompraService.crearOrdenCompra(req.body);
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

    static async obtenerOrdenPorId(req, res) {
        try {
            const { id } = req.params;
            const result = await ordenCompraService.obtenerOrdenPorId(id);
            if (!result) return res.status(404).json({ error: 'Orden no encontrada' });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async actualizarOrden(req, res) {
        try {
            const { id } = req.params;
            const result = await ordenCompraService.actualizarOrden(id, req.body);
            res.status(200).json({ message: 'Orden actualizada', ordenCompra: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async eliminarOrden(req, res) {
        try {
            const { id } = req.params;
            await ordenCompraService.eliminarOrden(id);
            res.status(200).json({ message: 'Orden eliminada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async actualizarEstadoOrden(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const result = await ordenCompraService.actualizarEstadoOrden(id, estado);
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
