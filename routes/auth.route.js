import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();
const { register, login } = AuthController;


router.post('/register', register);

router.post('/login', login);

export default router;
