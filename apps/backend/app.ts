import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { databaseService } from './services/databaseService';
import promptRoutes from './routes/promptRoutes';
import fileRoutes from './routes/fileRoutes';
import photoRoutes from './routes/photoRoutes';
import authRoutes from './routes/authRoutes';
import rouletteRoutes from './routes/rouletteRoutes';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

export const AppDataSource = databaseService.getDataSource();

// Configure Socket.IO with CORS
export const io = new Server(server, {
  cors: {
    origin: ['https://comicif.rifeeh.com', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: ['https://comicif.rifeeh.com', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/roulette', rouletteRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

databaseService.initialize()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log('WebSocket disponível para atualizações em tempo real');
    });
  })
  .catch((error) => {
    console.error("Erro ao inicializar o servidor:", error);
    process.exit(1);
  });