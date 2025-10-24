import express from 'express';
import {
  spinRoulette,
  getCurrentResult,
  listCategories,
  listPrompts,
  spinPrompts,
  drawPrompt,
  drawRandomPrompt
} from '../controllers/rouletteController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes are protected (require authentication)
router.post('/spin', authMiddleware, spinRoulette);
router.get('/current', authMiddleware, getCurrentResult);
router.get('/categories', authMiddleware, listCategories);
router.get('/prompts', authMiddleware, listPrompts);
router.post('/spin-prompts', authMiddleware, spinPrompts);
router.post('/draw-prompt', authMiddleware, drawPrompt);
router.post('/draw-random-prompt', authMiddleware, drawRandomPrompt);

export default router;
