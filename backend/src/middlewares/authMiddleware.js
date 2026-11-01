import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour vérifier si l'utilisateur est connecté
export const protect = async (req, res, next) => {
  let token;

  // Le token est envoyé dans les headers : "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // On extrait le token (on enlève "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // On vérifie et décode le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // On cherche l'utilisateur dans la base (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Compte désactivé' });
      }

      next(); // Tout est bon, on passe à la suite
    } catch (error) {
      res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier les rôles (ex: seul admin et secretaire peuvent créer)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle '${req.user.role}' n'est pas autorisé à faire cette action` 
      });
    }
    next();
  };
};