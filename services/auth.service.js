// services/AuthService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/usuarios.model.js';

const userRepo = new User();

export class AuthService {
    async register(name, email, password, role = 'vendedor') {
        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) throw new Error('Usuario ya existe');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userRepo.create(name, email, hashedPassword, role);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return { token, user };
    }

    async login(email, password) {
        const user = await userRepo.findByEmail(email);
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new Error('Credenciales inválidas');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return {
            token,
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
}

