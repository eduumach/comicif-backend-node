import { Router } from 'express';
import { loginController } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', loginController);

export default router;