import { Router } from 'express';
import { createDevis } from '../controllers/devisController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Configuration de Multer pour accepter 2 champs spécifiques
const uploadFields = upload.fields([
  { name: 'fichierPDF', maxCount: 1 },
  { name: 'photoProfil', maxCount: 1 },
]);

// Route POST /api/devis
// 1. protect (vérifie le token)
// 2. authorize (vérifie le rôle : admin ou secretaire)
// 3. uploadFields (gère les fichiers)
// 4. createDevis (le contrôleur)
router.post(
  '/',
  protect,
  authorize('admin', 'secretaire'),
  uploadFields,
  createDevis
);

export default router;