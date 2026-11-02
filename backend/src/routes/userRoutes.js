import { Router } from 'express';
import { getUsers, createUser, toggleUserStatus, resetUserPassword } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Toutes ces routes sont protégées ET réservées uniquement à l'Admin
router.use(protect, authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/reset-password', resetUserPassword);

export default router;