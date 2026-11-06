import { Router } from 'express';
import { 
  createDevis, 
  getDevis, 
  togglePublish, 
  updateStatus,
  deleteDevis,  // <-- NOUVEAU
  updateDevis   // <-- NOUVEAU
} from '../controllers/devisController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

const uploadFields = upload.fields([
  { name: 'fichierPDF', maxCount: 1 },
  { name: 'photoProfil', maxCount: 1 },
]);

router.post('/', protect, authorize('admin', 'secretaire'), uploadFields, createDevis);
router.get('/', protect, getDevis);
router.patch('/:id/publish', protect, authorize('admin', 'secretaire'), togglePublish);
router.patch('/:id/status', protect, authorize('admin', 'secretaire'), updateStatus);

// NOUVELLES ROUTES
router.put('/:id', protect, authorize('admin', 'secretaire'), uploadFields, updateDevis);
router.delete('/:id', protect, authorize('admin', 'secretaire'), deleteDevis);

export default router;