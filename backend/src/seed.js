import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // On vérifie si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('⚠️ Un administrateur existe déjà. Arrêt du script.');
      process.exit(0);
    }

    // Création de l'admin par défaut
    const admin = await User.create({
      name: 'Administrateur',
      email: 'admin@gestionsdevis.com',
      password: 'admin123', // Sera haché automatiquement par le hook pre('save')
      role: 'admin',
    });

    console.log('🎉 Administrateur créé avec succès :');
    console.log(`   Email : ${admin.email}`);
    console.log(`   Mot de passe : admin123 (à changer plus tard)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error.message);
    process.exit(1);
  }
};

seedAdmin();