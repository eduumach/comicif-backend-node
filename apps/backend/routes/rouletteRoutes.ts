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
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes are protected and require admin (upload-only cannot access roulette)
router.post('/spin', authMiddleware, adminOnlyMiddleware, spinRoulette);
router.get('/current', authMiddleware, adminOnlyMiddleware, getCurrentResult);
router.get('/categories', authMiddleware, adminOnlyMiddleware, listCategories);
router.get('/prompts', authMiddleware, adminOnlyMiddleware, listPrompts);
router.post('/spin-prompts', authMiddleware, adminOnlyMiddleware, spinPrompts);
router.post('/draw-prompt', authMiddleware, adminOnlyMiddleware, drawPrompt);
router.post('/draw-random-prompt', authMiddleware, adminOnlyMiddleware, drawRandomPrompt);

export default router;
