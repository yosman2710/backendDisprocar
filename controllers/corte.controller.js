import { CorteService } from '../services/corte.service.js';

const corteService = new CorteService();

export class CorteController {
    static async listarTiposCorte(req, res) {
        try {
            const tipos = await corteService.listarTiposCorte();
            res.json({
                success: true,
                message: 'Tipos de corte disponibles',
                data: tipos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async marcarDesguazada(req, res) {
        try {
            const { id } = req.body;
            const result = await corteService.marcarDesguazada(id);
            res.json({
                success: true,
                message: 'Res marcada como desguazada',
                data: {
                    id: result.id,
                    estado: result.estado,
                    numero: result.numero
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async registrarCortes(req, res) {
        try {
            const { id, cortes } = req.body;
            console.log(`[Debonning] Solicitud para res ID: ${id}, Cantidad de cortes: ${cortes.length}`);
            const result = await corteService.registrarCortes(id, cortes);
            console.log(`[Debonning] Registro exitoso para res ID: ${id}`);
            res.status(201).json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error(`[Debonning] Error en registro para res ID: ${req.body.id}:`, error.message);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    static async crearTipoCorte(req, res) {
        try {
            const { nombre } = req.body;
            const result = await corteService.crearTipoCorte({ nombre });
            res.status(201).json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    static async listarCortesPorRes(req, res) {
        try {
            const { id } = req.params;
            const result = await corteService.listarCortesPorRes(id);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

