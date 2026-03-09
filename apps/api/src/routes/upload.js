import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';

const router  = Router();
const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (req, file, cb) => {
    const unique = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload  = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('PDF only'));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/upload/cv
router.post('/cv', requireAuth, upload.single('cv'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, originalName: req.file.originalname });
});

export default router;