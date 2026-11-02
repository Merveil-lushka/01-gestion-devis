import mongoose from 'mongoose';

const devisSchema = new mongoose.Schema(
  {
    // --- Champs du cahier des charges ---
    numeroDevis: {
      type: String,
      required: [true, 'Le numéro de devis est obligatoire'],
      unique: true,
      trim: true,
    },
    nomClient: {
      type: String,
      required: [true, 'Le nom du client est obligatoire'],
      trim: true,
    },
    nomChantier: {
      type: String,
      required: [true, 'Le nom du chantier est obligatoire'],
      trim: true,
    },
    dateDevis: {
      type: Date,
      required: [true, 'La date du devis est obligatoire'],
      default: Date.now,
    },
    
    // --- Fichiers (chemins vers les fichiers stockés) ---
    photoProfil: {
      type: String, // Stockera le chemin de l'image compressée
      required: [true, 'La photo de profil est obligatoire'],
    },
    fichierPDF: {
      type: String, // Stockera le chemin du PDF
      required: [true, 'Le fichier PDF du BAT est obligatoire'],
    },

    // --- Tes ajouts : Mentions et Statut ---
    statut: {
      type: String,
      enum: ['en_cours', 'termine'],
      default: 'en_cours',
    },
    note: {
      type: String,
      maxlength: [500, 'La note ne peut pas dépasser 500 caractères'],
      trim: true,
    },

    // --- Tes ajouts : Gestion de publication pour les techniciens ---
    isPublished: {
      type: Boolean,
      default: false, // Par défaut, non publié (visible seulement par admin/secrétaire)
    },
    publishedAt: {
      type: Date,
    },

    // --- Traçabilité (Qui a créé/modifié) ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

// Index pour accélérer la recherche (Cahier des charges §8)
devisSchema.index({ numeroDevis: 'text', nomClient: 'text', nomChantier: 'text' });

const Devis = mongoose.model('Devis', devisSchema);

export default Devis;