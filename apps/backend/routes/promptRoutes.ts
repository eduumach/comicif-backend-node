import express from 'express';
import { listPrompts, createPrompt, getPromptById, updatePrompt, deletePrompt } from '../controllers/promptController';

const router = express.Router();
router.get('/', listPrompts);
router.post('/', createPrompt);
router.get('/:id', getPromptById);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);
export default router;