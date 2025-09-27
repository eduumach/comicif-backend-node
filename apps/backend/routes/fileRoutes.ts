import { Router } from 'express';
import { uploadFile, downloadFile, deleteFile, getFileUrl, listFiles } from '../controllers/fileController';

const router = Router();

router.post('/upload', uploadFile);
router.get('/download/:fileName', downloadFile);
router.delete('/:fileName', deleteFile);
router.get('/url/:fileName', getFileUrl);
router.get('/', listFiles);

export default router;