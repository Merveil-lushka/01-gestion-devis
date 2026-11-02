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

// @desc    Obtenir la liste des devis (avec filtres et recherche)
// @route   GET /api/devis
// @access  Privé (Tous les rôles, mais visibilité restreinte)
export const getDevis = async (req, res) => {
  try {
    const { search, statut } = req.query;
    let query = {};

    // 1. Gestion des rôles (Visibilité)
    // Admin et Secrétaire voient tout. Les autres ne voient que ce qui est publié.
    if (req.user.role !== 'admin' && req.user.role !== 'secretaire') {
      query.isPublished = true;
    }

    // 2. Recherche (par numéro, client ou chantier)
    if (search) {
      query.$or = [
        { numeroDevis: { $regex: search, $options: 'i' } },
        { nomClient: { $regex: search, $options: 'i' } },
        { nomChantier: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Filtre par statut (en_cours ou termine)
    if (statut) {
      query.statut = statut;
    }

    // 4. Récupération et tri (du plus récent au plus ancien)
    const devisList = await Devis.find(query)
      .populate('createdBy', 'name email') // Remplace l'ID par le nom/email du créateur
      .sort({ createdAt: -1 });

    res.json(devisList);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};

// @desc    Publier ou dépublier un devis
// @route   PATCH /api/devis/:id/publish
// @access  Privé (Admin, Secrétaire)
export const togglePublish = async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);

    if (!devis) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // On inverse l'état (si c'était true, ça devient false, et inversement)
    devis.isPublished = !devis.isPublished;
    devis.publishedAt = devis.isPublished ? Date.now() : null;

    await devis.save();

    res.json({
      message: devis.isPublished ? 'Devis publié avec succès' : 'Devis dépublié',
      isPublished: devis.isPublished,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Changer le statut (en_cours / termine) et/ou modifier la note
// @route   PATCH /api/devis/:id/status
// @access  Privé (Admin, Secrétaire)
export const updateStatus = async (req, res) => {
  try {
    const { statut, note } = req.body;
    const devis = await Devis.findById(req.params.id);

    if (!devis) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Validation du statut
    if (statut && !['en_cours', 'termine'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide (en_cours ou termine)' });
    }

    // Mise à jour des champs
    if (statut) devis.statut = statut;
    if (note !== undefined) devis.note = note;
    
    devis.statusUpdatedBy = req.user._id; // On garde une trace de qui a fait la modif

    const updatedDevis = await devis.save();

    res.json({
      message: 'Statut mis à jour',
      statut: updatedDevis.statut,
      note: updatedDevis.note,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};