import { Router } from 'express';
import { 
  createDevis, 
  getDevis, 
  togglePublish, 
  updateStatus 
} from '../controllers/devisController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

const uploadFields = upload.fields([
  { name: 'fichierPDF', maxCount: 1 },
  { name: 'photoProfil', maxCount: 1 },
]);

// --- ROUTES ---
// Création
router.post('/', protect, authorize('admin', 'secretaire'), uploadFields, createDevis);

// Liste / Recherche (Accessible à tous les connectés)
router.get('/', protect, getDevis);

// Publication (Admin / Secrétaire)
router.patch('/:id/publish', protect, authorize('admin', 'secretaire'), togglePublish);

// Changement de statut (Admin / Secrétaire)
router.patch('/:id/status', protect, authorize('admin', 'secretaire'), updateStatus);

export default router;