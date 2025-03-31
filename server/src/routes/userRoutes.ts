import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser
} from '../controllers/UserController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Admin-only routes
router.get('/', authorize(['admin']), getAllUsers);
router.post('/', authorize(['admin']), createUser);
router.delete('/:id', authorize(['admin']), deleteUser);
router.get('/:id/roles', authorize(['admin']), getUserRoles);
router.post('/:id/roles', authorize(['admin']), assignRoleToUser);
router.delete('/:id/roles/:role', authorize(['admin']), removeRoleFromUser);

// Admin and self routes
router.get('/:id', (req, res, next) => {
  // Allow users to access their own data
  if (req.user && req.params.id === req.user.id) {
    return next();
  }
  // Otherwise, only admins can access
  return authorize(['admin'])(req, res, next);
}, getUserById);

router.put('/:id', (req, res, next) => {
  // Allow users to update their own data
  if (req.user && req.params.id === req.user.id) {
    return next();
  }
  // Otherwise, only admins can update
  return authorize(['admin'])(req, res, next);
}, updateUser);

export default router;