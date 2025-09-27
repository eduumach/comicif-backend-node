import { Router } from 'express';
import { generatePhotoFromPrompt, listPhotos } from '../controllers/photoController';
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

router.post('/generate', upload.single('photo'), generatePhotoFromPrompt);
router.get('/', listPhotos);

export default router;