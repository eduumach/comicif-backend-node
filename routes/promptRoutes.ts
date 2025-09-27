import express from 'express';
import { listPrompts, createPrompt } from '../controllers/promptController';

const router = express.Router();
router.get('/prompt', listPrompts);
router.post('/prompt', createPrompt);
export default router;