import { Router } from 'express';
import { generatePhotoFromPrompt, listPhotos, likePhoto } from '../controllers/photoController';
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

// Protected routes (require authentication)
router.post('/generate', authMiddleware, upload.single('photo'), generatePhotoFromPrompt);
router.post('/:id/like', authMiddleware, likePhoto);


export default router;