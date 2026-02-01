import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { register, login, verify, updatePassword } from '../controllers/auth.controller.js';

const router = Router();


router.post('/register', register);

router.post('/login', login);

router.get('/verify', verifyToken, verify);

router.put('/update-password', verifyToken, updatePassword);

export default router;
