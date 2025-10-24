import { Request, Response } from 'express';
import { Photo } from '../entities/Photo';
import { Prompt } from '../entities/Prompt';
import { databaseService } from '../services/databaseService';
import { googleGenAIService } from '../services/googleGenAIService';
import { minioService } from '../services/minioService';
import { io } from '../app';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const generatePhotoFromPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Foto é obrigatória' });
      return;
    }

    const promptRepository = databaseService.getDataSource().getRepository(Prompt);

    const randomPrompt = await promptRepository
      .createQueryBuilder('prompt')
      .orderBy('RANDOM()')
      .getOne();

    if (!randomPrompt) {
      res.status(404).json({ error: 'Nenhum prompt encontrado no banco de dados' });
      return;
    }

    const imageBuffer = await googleGenAIService.generateImage(
      randomPrompt.prompt,
      req.file.buffer,
      req.file.mimetype
    );

    const fileName = `generated-${uuidv4()}.png`;

    await minioService.uploadFile(fileName, imageBuffer, 'image/png');

    const photoRepository = databaseService.getDataSource().getRepository(Photo);
    const newPhoto = new Photo();
    newPhoto.path = fileName;
    newPhoto.prompt = randomPrompt;
    newPhoto.likes = 0;
    newPhoto.type = 'generated';

    const savedPhoto = await photoRepository.save(newPhoto);
    const link = await minioService.getFileUrl(fileName);

    const photoResponse = {
      id: savedPhoto.id,
      path: link,
      likes: savedPhoto.likes,
      createdAt: savedPhoto.createdAt,
      updatedAt: savedPhoto.updatedAt,
      prompt: {
        id: randomPrompt.id,
        title: randomPrompt.title,
        prompt: randomPrompt.prompt
      }
    };

    // Emit new photo event to all connected clients
    io.emit('new-photo', photoResponse);

    res.status(201).json({
      message: 'Imagem gerada e salva com sucesso',
      photo: photoResponse
    });

  } catch (error) {
    console.error('Erro ao gerar foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const photoRepository = databaseService.getDataSource().getRepository(Photo);

    const photos = await photoRepository.find({
      relations: ['prompt'],
      order: {
        createdAt: 'DESC'
      }
    });

    // Filter out photos with null path
    const validPhotos = photos.filter(photo => photo.path !== null && photo.path !== undefined);

    const links = await Promise.all(validPhotos.map(photo => minioService.getFileUrl(photo.path)));

    res.json({
      photos: validPhotos.map((photo, index) => ({
        id: photo.id,
        path: links[index],
        likes: photo.likes,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        prompt: photo.prompt ? {
          id: photo.prompt.id,
          title: photo.prompt.title,
          prompt: photo.prompt.prompt
        } : null
      })),
      count: validPhotos.length
    });

  } catch (error) {
    console.error('Erro ao listar fotos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const likePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const photoId = parseInt(req.params.id);

    if (isNaN(photoId)) {
      res.status(400).json({ error: 'ID da foto inválido' });
      return;
    }

    const photoRepository = databaseService.getDataSource().getRepository(Photo);

    const photo = await photoRepository.findOne({
      where: { id: photoId },
      relations: ['prompt']
    });

    if (!photo) {
      res.status(404).json({ error: 'Foto não encontrada' });
      return;
    }

    // Increment likes
    photo.likes += 1;
    const updatedPhoto = await photoRepository.save(photo);

    // Get file URL
    const link = await minioService.getFileUrl(updatedPhoto.path);

    res.json({
      id: updatedPhoto.id,
      path: link,
      likes: updatedPhoto.likes,
      createdAt: updatedPhoto.createdAt,
      updatedAt: updatedPhoto.updatedAt,
      prompt: updatedPhoto.prompt ? {
        id: updatedPhoto.prompt.id,
        title: updatedPhoto.prompt.title,
        prompt: updatedPhoto.prompt.prompt
      } : null
    });

  } catch (error) {
    console.error('Erro ao curtir foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const generatePhotoFromPromptId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promptId } = req.body;
    
    if (!req.file) {
      res.status(400).json({ error: 'Foto é obrigatória' });
      return;
    }
    if (!promptId) {
      res.status(400).json({ error: 'promptId é obrigatório' });
      return;
    }

    const promptRepository = databaseService.getDataSource().getRepository(Prompt);

    const prompt = await promptRepository.findOneBy({ id: promptId });

    if (!prompt) {
      res.status(404).json({ error: 'Prompt não encontrado no banco de dados' });
      return;
    }

    const imageBuffer = await googleGenAIService.generateImage(
      prompt.prompt,
      req.file.buffer,
      req.file.mimetype
    );

    const fileName = `generated-${uuidv4()}.png`;

    await minioService.uploadFile(fileName, imageBuffer, 'image/png');

    const photoRepository = databaseService.getDataSource().getRepository(Photo);
    const newPhoto = new Photo();
    newPhoto.path = fileName;
    newPhoto.prompt = prompt;
    newPhoto.likes = 0;
    newPhoto.type = 'generated';

    const savedPhoto = await photoRepository.save(newPhoto);
    const link = await minioService.getFileUrl(fileName);

    const photoResponse = {
      id: savedPhoto.id,
      path: link,
      likes: savedPhoto.likes,
      createdAt: savedPhoto.createdAt,
      updatedAt: savedPhoto.updatedAt,
      prompt: {
        id: savedPhoto.prompt.id,
        title: savedPhoto.prompt.title,
        prompt: savedPhoto.prompt.prompt
      }
    };

    // Emit new photo event to all connected clients
    io.emit('new-photo', photoResponse);

    res.status(201).json({
      message: 'Imagem gerada e salva com sucesso',
      photo: photoResponse
    });

  } catch (error) {
    console.error('Erro ao gerar foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getPhotosSince = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timestamp } = req.params;

    if (!timestamp) {
      res.status(400).json({ error: 'Timestamp é obrigatório' });
      return;
    }

    const sinceDate = new Date(timestamp);

    if (isNaN(sinceDate.getTime())) {
      res.status(400).json({ error: 'Timestamp inválido' });
      return;
    }

    const photoRepository = databaseService.getDataSource().getRepository(Photo);

    // Use MoreThan from TypeORM for proper date comparison
    const { MoreThan } = await import('typeorm');

    const photos = await photoRepository.find({
      relations: ['prompt'],
      where: {
        createdAt: MoreThan(sinceDate)
      },
      order: {
        createdAt: 'DESC'
      }
    });

    // Filter out photos with null path
    const validPhotos = photos.filter(photo => photo.path !== null && photo.path !== undefined);

    const links = await Promise.all(validPhotos.map(photo => minioService.getFileUrl(photo.path)));

    res.json({
      photos: validPhotos.map((photo, index) => ({
        id: photo.id,
        path: links[index],
        likes: photo.likes,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        prompt: photo.prompt ? {
          id: photo.prompt.id,
          title: photo.prompt.title,
          prompt: photo.prompt.prompt
        } : null
      })),
      count: validPhotos.length
    });

  } catch (error) {
    console.error('Erro ao buscar fotos recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};