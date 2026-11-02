import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Créer le dossier "uploads" s'il n'existe pas
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configurer le stockage sur le disque
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // On crée un nom unique : date-nom-original-sans-espaces
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

// 3. Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'fichierPDF') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Le fichier BAT doit être un PDF'), false);
    }
  } else if (file.fieldname === 'photoProfil') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('La photo de profil doit être une image'), false);
    }
  } else {
    cb(new Error('Champ de fichier non reconnu'), false);
  }
};

// 4. Exporter le middleware configuré
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10 Mo par fichier
});