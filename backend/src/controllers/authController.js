import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Génère un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Connexion de l'utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Vérifier que l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // 2. Chercher l'utilisateur par email
    const user = await User.findOne({ email });

    // 3. Vérifier si l'utilisateur existe ET si le mot de passe correspond
    if (user && (await user.matchPassword(password))) {
      
      // 4. Vérifier si le compte est actif
      if (!user.isActive) {
        return res.status(403).json({ message: 'Ce compte a été désactivé' });
      }

      // 5. Renvoyer les infos + le token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Privé
export const getMe = async (req, res) => {
  // req.user est injecté par le middleware 'protect'
  res.json(req.user);
};