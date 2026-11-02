import User from '../models/User.js';

// @desc    Obtenir la liste de tous les utilisateurs
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer un nouvel utilisateur (Secrétaire, Technicien, etc.)
// @route   POST /api/users
// @access  Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ name, email, password, role });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Activer ou désactiver un compte (au lieu de le supprimer)
// @route   PATCH /api/users/:id/status
// @access  Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher l'admin de se désactiver lui-même
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: user.isActive ? 'Compte activé' : 'Compte désactivé',
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Réinitialiser le mot de passe d'un utilisateur
// @route   PATCH /api/users/:id/reset-password
// @access  Admin
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 6 caractères' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.password = newPassword; // Le hook 'pre-save' de Mongoose va le hacher automatiquement
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};