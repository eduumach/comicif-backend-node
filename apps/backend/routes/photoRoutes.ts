import { Router } from 'express';
import { generatePhotoFromPrompt, listPhotos, likePhoto, generatePhotoFromPromptId, getPhotosSince } from '../controllers/photoController';
import { authMiddleware, adminOnlyMiddleware } from '../middleware/auth';
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
router.get('/since/:timestamp', getPhotosSince);
router.post('/:id/like', likePhoto);

// Protected routes (require admin authentication - upload-only cannot generate photos)
router.post('/generate', authMiddleware, adminOnlyMiddleware, upload.single('photo'), generatePhotoFromPrompt);
router.post('/generate-from-prompt-id', authMiddleware, adminOnlyMiddleware, upload.single('photo'), generatePhotoFromPromptId);


export default router;