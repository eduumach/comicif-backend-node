import express from 'express';
import { listPrompts, createPrompt, getPromptById, updatePrompt, deletePrompt } from '../controllers/promptController';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', listPrompts);
router.get('/:id', getPromptById);

// Protected routes (require admin authentication)
router.post('/', authMiddleware, adminOnlyMiddleware, createPrompt);
router.put('/:id', authMiddleware, adminOnlyMiddleware, updatePrompt);
router.delete('/:id', authMiddleware, adminOnlyMiddleware, deletePrompt);

export default router;