import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/CategoryController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes - Admin and Pharmacist only
router.use(protect);
router.post('/', authorize(['admin', 'pharmacist']), createCategory);
router.put('/:id', authorize(['admin', 'pharmacist']), updateCategory);
router.delete('/:id', authorize(['admin']), deleteCategory);

export default router;