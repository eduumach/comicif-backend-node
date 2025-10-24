import { Request, Response } from 'express';
import { minioService } from '../services/minioService';
import { databaseService } from '../services/databaseService';
import { Photo } from '../entities/Photo';
import { v4 as uuidv4 } from 'uuid';

export const uploadOriginalPhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileName = `original-${uuidv4()}.png`;

        // Upload to MinIO
        await minioService.uploadFile(fileName, file.buffer, file.mimetype);

        // Save to database as original photo (without prompt)
        const photoRepo = databaseService.getDataSource().getRepository(Photo);
        const photo = photoRepo.create({
            path: fileName,
            type: 'original',
            likes: 0
        });

        await photoRepo.save(photo);

        const photoUrl = await minioService.getFileUrl(fileName);

        res.status(201).json({
            message: 'Original photo uploaded successfully',
            photo: {
                id: photo.id,
                path: photoUrl,
                type: photo.type,
                createdAt: photo.createdAt
            }
        });
    } catch (error) {
        console.error('Upload original photo error:', error);
        res.status(500).json({
            error: 'Failed to upload original photo',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const listOriginalPhotos = async (req: Request, res: Response) => {
    try {
        const photoRepo = databaseService.getDataSource().getRepository(Photo);
        
        const photos = await photoRepo.find({
            where: { type: 'original' },
            order: { createdAt: 'DESC' }
        });

        // Get URLs for all photos
        const photosWithUrls = await Promise.all(
            photos.map(async (photo) => ({
                ...photo,
                path: await minioService.getFileUrl(photo.path)
            }))
        );

        res.json({
            photos: photosWithUrls,
            total: photosWithUrls.length
        });
    } catch (error) {
        console.error('List original photos error:', error);
        res.status(500).json({
            error: 'Failed to list original photos',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
