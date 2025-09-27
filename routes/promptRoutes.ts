import express from 'express';
import { listPrompts, createPrompt, getPromptById, updatePrompt, deletePrompt } from '../controllers/promptController';

const router = express.Router();
router.get('/prompt', listPrompts);
router.post('/prompt', createPrompt);
router.get('/prompt/:id', getPromptById);
router.put('/prompt/:id', updatePrompt);
router.delete('/prompt/:id', deletePrompt);
export default router;