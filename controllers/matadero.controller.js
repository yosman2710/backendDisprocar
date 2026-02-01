import { MataderoService } from '../services/matadero.service.js';

const mataderoService = new MataderoService();

export class MataderoController {
    static async crearMatadero(req, res) {
        try {
            const result = await mataderoService.crearMatadero(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listarMataderos(req, res) {
        try {
            const mataderos = await mataderoService.listarMataderos();
            res.json(mataderos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
