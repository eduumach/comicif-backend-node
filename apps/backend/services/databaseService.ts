import { DataSource } from 'typeorm';
import { Prompt } from '../entities/Prompt';
import { Photo } from '../entities/Photo';
import { RouletteResult } from '../entities/RouletteResult';

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "comicif",
      synchronize: true, // TODO: Apenas para desenvolvimento
      logging: false,
      entities: [
        Prompt,
        Photo,
        RouletteResult
      ],
      migrations: [],
      subscribers: [],
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.dataSource.initialize();
      console.log("Conexão com PostgreSQL estabelecida com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar com o banco de dados:", error);
      throw error;
    }
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

export const databaseService = DatabaseService.getInstance();