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
            const { resId } = req.params;
            const res = await corteService.marcarDesguazada(resId);
            res.json({
                success: true,
                message: 'Res marcada como desguazada',
                data: {
                    id: res.id,
                    estado: res.estado,
                    numero: res.numero
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
            const { resId } = req.params;
            const cortesData = req.body;
            const result = await corteService.registrarCortes(resId, cortesData);
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
}

