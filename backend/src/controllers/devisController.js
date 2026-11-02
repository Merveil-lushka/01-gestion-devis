import Devis from '../models/Devis.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// @desc    Créer un nouveau devis
// @route   POST /api/devis
// @access  Privé (Admin, Secrétaire)
export const createDevis = async (req, res) => {
  try {
    const { numeroDevis, nomClient, nomChantier, dateDevis, note } = req.body;

    // 1. Vérifier que les fichiers sont présents
    if (!req.files || !req.files.fichierPDF || !req.files.photoProfil) {
      return res.status(400).json({ message: 'Le fichier PDF et la photo de profil sont obligatoires' });
    }

    const pdfFile = req.files.fichierPDF[0];
    const photoFile = req.files.photoProfil[0];

    // 2. Compression de la photo avec Sharp
    const compressedPhotoName = `compressed-${Date.now()}-${path.parse(photoFile.filename).name}.webp`;
    const compressedPhotoPath = path.join('uploads', compressedPhotoName);

    await sharp(photoFile.path)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true }) // Max 400x400
      .webp({ quality: 80 }) // Format webp, qualité 80%
      .toFile(compressedPhotoPath);

    // 3. Supprimer la photo originale (non compressée) pour gagner de la place
    fs.unlinkSync(photoFile.path);

    // 4. Créer le devis en base de données
    const devis = await Devis.create({
      numeroDevis,
      nomClient,
      nomChantier,
      dateDevis: dateDevis || Date.now(),
      note,
      fichierPDF: pdfFile.path.replace(/\\/g, '/'), // Chemin du PDF
      photoProfil: compressedPhotoPath.replace(/\\/g, '/'), // Chemin de la photo compressée
      createdBy: req.user._id, // Vient du middleware 'protect'
    });

    res.status(201).json(devis);
  } catch (error) {
    // En cas d'erreur (ex: numéro de devis en double), on nettoie les fichiers uploadés
    if (req.files) {
      if (req.files.fichierPDF) fs.unlinkSync(req.files.fichierPDF[0].path);
      if (req.files.photoProfil) fs.unlinkSync(req.files.photoProfil[0].path);
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ce numéro de devis existe déjà' });
    }
    res.status(500).json({ message: 'Erreur lors de la création du devis', error: error.message });
  }
};