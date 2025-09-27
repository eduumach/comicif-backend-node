import { Request, Response } from 'express';
import { minioService } from '../services/minioService';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.fileName || !req.body.fileData) {
      res.status(400).json({ error: 'Nome do arquivo e dados são obrigatórios' });
      return;
    }

    const { fileName, fileData, contentType } = req.body;
    const fileBuffer = Buffer.from(fileData, 'base64');

    const uploadedFileName = await minioService.uploadFile(fileName, fileBuffer, contentType);

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      fileName: uploadedFileName
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
      return;
    }

    const fileBuffer = await minioService.downloadFile(fileName);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
      return;
    }

    await minioService.deleteFile(fileName);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getFileUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    const { expiry } = req.query;

    if (!fileName) {
      res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
      return;
    }

    const expiryTime = expiry ? parseInt(expiry as string) : undefined;
    const url = await minioService.getFileUrl(fileName, expiryTime);

    res.json({
      fileName,
      url,
      expiresIn: expiryTime || 7 * 24 * 60 * 60
    });
  } catch (error) {
    console.error('Erro ao gerar URL:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prefix } = req.query;

    const files = await minioService.listFiles(prefix as string);

    res.json({
      files,
      count: files.length
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};