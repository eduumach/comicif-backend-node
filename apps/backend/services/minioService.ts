import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export class MinioService {
  private client: Client;
  private bucketName: string;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'comicif-bucket';
    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      const bucketExists = await this.client.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket ${this.bucketName} criado com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao inicializar bucket:', error);
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType?: string): Promise<string> {
    try {
      const metaData = contentType ? { 'Content-Type': contentType } : undefined;
      await this.client.putObject(this.bucketName, fileName, fileBuffer, fileBuffer.length, metaData);
      return fileName;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(this.bucketName, fileName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  async getFileUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.client.presignedGetObject(this.bucketName, fileName, expiry);
    } catch (error) {
      console.error('Erro ao gerar URL do arquivo:', error);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const stream = this.client.listObjects(this.bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj.name || ''));
        stream.on('end', () => resolve(files));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }
}

export const minioService = new MinioService();