import { Router } from 'express';
import { generatePhotoFromPrompt, listPhotos, likePhoto, generatePhotoFromPromptId } from '../controllers/photoController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Public routes
router.get('/', listPhotos);
router.post('/:id/like', likePhoto);

// Protected routes (require authentication)
router.post('/generate', authMiddleware, upload.single('photo'), generatePhotoFromPrompt);
router.post('/generate-from-prompt-id', authMiddleware, upload.single('photo'), generatePhotoFromPromptId);


export default router;