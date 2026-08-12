import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadFile,
  uploadWithCompression,
  getUploadHistory,
  getCompressionRecommendations,
} from '../controllers/upload';
import { requireConnectedSession, extractSessionId } from '../middleware/auth';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../temp/uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/3gpp',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

const router = Router();

// Apply session ID extraction
router.use(extractSessionId);

// Upload endpoints
router.post('/', requireConnectedSession, upload.single('file'), uploadFile);
router.post('/with-compression', requireConnectedSession, upload.single('file'), uploadWithCompression);

// Recommendations endpoint
router.post('/recommendations', upload.single('file'), getCompressionRecommendations);

// History endpoint
router.get('/history', requireConnectedSession, getUploadHistory);

export default router;
