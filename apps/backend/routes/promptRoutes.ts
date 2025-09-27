import express from 'express';
import { listPrompts, createPrompt, getPromptById, updatePrompt, deletePrompt } from '../controllers/promptController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', listPrompts);
router.get('/:id', getPromptById);

// Protected routes (require authentication)
router.post('/', authMiddleware, createPrompt);
router.put('/:id', authMiddleware, updatePrompt);
router.delete('/:id', authMiddleware, deletePrompt);

export default router;