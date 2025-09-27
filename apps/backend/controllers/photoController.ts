import { Request, Response } from 'express';
import { Photo } from '../entities/Photo';
import { Prompt } from '../entities/Prompt';
import { databaseService } from '../services/databaseService';
import { googleGenAIService } from '../services/googleGenAIService';
import { minioService } from '../services/minioService';
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

    const savedPhoto = await photoRepository.save(newPhoto);
    const link = await minioService.getFileUrl(fileName);

    res.status(201).json({
      message: 'Imagem gerada e salva com sucesso',
      photo: {
        id: savedPhoto.id,
        path: link,
        likes: savedPhoto.likes,
        createdAt: savedPhoto.createdAt,
        prompt: {
          id: randomPrompt.id,
          title: randomPrompt.title,
          prompt: randomPrompt.prompt
        }
      }
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

    const links = await Promise.all(photos.map(photo => minioService.getFileUrl(photo.path)));

    res.json({
      photos: photos.map((photo, index) => ({
        id: photo.id,
        path: links[index],
        likes: photo.likes,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        prompt: {
          id: photo.prompt.id,
          title: photo.prompt.title,
          prompt: photo.prompt.prompt
        }
      })),
      count: photos.length
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
      prompt: {
        id: updatedPhoto.prompt.id,
        title: updatedPhoto.prompt.title,
        prompt: updatedPhoto.prompt.prompt
      }
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

    const savedPhoto = await photoRepository.save(newPhoto);
    const link = await minioService.getFileUrl(fileName);

    res.status(201).json({
      message: 'Imagem gerada e salva com sucesso',
      photo: {
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
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};