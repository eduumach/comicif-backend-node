import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import { DataSource } from 'typeorm';
import tarefaRoutes from './routes/tarefaRoutes';
import { Tarefa } from './entities/Tarefa';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "comicif_db",
  synchronize: true, // TODO: Apenas para desenvolvimento
  logging: false,
  entities: [
    Tarefa
  ],
  migrations: [],
  subscribers: [],
});

app.use(express.json());

app.use('/api', tarefaRoutes);
AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com PostgreSQL estabelecida com sucesso!");
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar com o banco de dados:", error);
  });