import express from 'express';
import { listarTarefas, criarTarefa } from '../controllers/tarefaController';

const router = express.Router();
router.get('/tarefas', listarTarefas);
router.post('/tarefas', criarTarefa);
export default router;