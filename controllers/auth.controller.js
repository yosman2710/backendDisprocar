// controllers/AuthController.js
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, rol } = req.body;
            if (!name || !email || !password || !rol) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }
            const result = await authService.register(name, email, password, rol);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
