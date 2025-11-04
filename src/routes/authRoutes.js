import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { verifyEmail, resendVerification } from '../controllers/verifyController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;