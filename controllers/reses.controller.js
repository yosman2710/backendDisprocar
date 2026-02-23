import { ResesService } from '../services/reses.service.js';

const resesService = new ResesService();

export class ResesController {
    static async crearReses(req, res) {
        try {
            const resesData = req.body;
            const userId = req.user.id;
            console.log(resesData);

            const result = await resesService.crearReses(resesData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarReses(req, res) {
        try {
            const result = await resesService.listarReses();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarResesPorTicket(req, res) {
        try {
            const { orden_id } = req.params;
            const result = await resesService.listarResesPorTicket(orden_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async addPesoFrio(req, res) {
        try {
            const resesData = req.body;
            const result = await resesService.addPesoFrio(resesData);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async marcarCongelado(req, res) {
        try {
            const { id } = req.body;
            const result = await resesService.marcarCongelado(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}