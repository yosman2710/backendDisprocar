import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/verifyToken.js';

const router = Router();
const { register, login, verify } = AuthController;


router.post('/register', register);

router.post('/login', login);

router.get('/verify', auth, verify);

export default router;
