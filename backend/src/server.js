import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js'; // <-- NOUVEAU
import devisRoutes from './routes/devis.js'; // <-- NOUVEAU

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // <-- NOUVEAU

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devis', devisRoutes); // <-- NOUVEAU

// Démarrage
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  });
};

startServer();