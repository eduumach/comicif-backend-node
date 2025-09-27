import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import { databaseService } from './services/databaseService';
import promptRoutes from './routes/promptRoutes';
import fileRoutes from './routes/fileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

export const AppDataSource = databaseService.getDataSource();

app.use(express.json());

app.use('/api/prompts', promptRoutes);
app.use('/api/files', fileRoutes);

databaseService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao inicializar o servidor:", error);
    process.exit(1);
  });