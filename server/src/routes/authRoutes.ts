import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/AuthController';
import { protect } from '../middleware/authMiddlware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;