import { Router } from 'express';
import { 
  createHandler,
  getByIdHandler,
  getAllHandler,
  updateHandler,
  deleteHandler,
  downloadHandler,
  upload
} from '../controllers/attachment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/auth.middleware';

const router = Router();

// Create attachment (file upload)
router.post(
  '/',
  authenticateJWT,
  authorize('CREATE_ATTACHMENTS'),
  upload.single('file'),
  createHandler
);

// Get all attachments with pagination and filters
router.get(
  '/',
  authenticateJWT,
  authorize('READ_ATTACHMENTS'),
  getAllHandler
);

// Get attachment by ID
router.get(
  '/:id',
  authenticateJWT,
  authorize('READ_ATTACHMENTS'),
  getByIdHandler
);

// Download attachment file
router.get(
  '/:id/download',
  authenticateJWT,
  authorize('READ_ATTACHMENTS'),
  downloadHandler
);

// Update attachment metadata
router.put(
  '/:id',
  authenticateJWT,
  authorize('UPDATE_ATTACHMENTS'),
  updateHandler
);

// Delete attachment
router.delete(
  '/:id',
  authenticateJWT,
  authorize('DELETE_ATTACHMENTS'),
  deleteHandler
);

export default router;