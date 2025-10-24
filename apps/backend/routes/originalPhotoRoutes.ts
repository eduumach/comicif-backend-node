import { Router } from 'express';
import multer from 'multer';
import { uploadOriginalPhoto, listOriginalPhotos } from '../controllers/originalPhotoController';
import { anyAuthMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload original photo - aceita qualquer token válido (admin ou upload-only)
router.post('/', anyAuthMiddleware, upload.single('photo'), uploadOriginalPhoto);

// List original photos - aceita qualquer token válido
router.get('/', anyAuthMiddleware, listOriginalPhotos);

export default router;
