import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  assignCategoryToProduct,
  removeCategoryFromProduct,
  getProductsByCategory,
  searchProducts
} from '../controllers/ProductController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.get('/:id/categories', getProductCategories);

// Protected routes - Admin and Pharmacist only
router.use(protect);
router.post('/', authorize(['admin', 'pharmacist']), createProduct);
router.put('/:id', authorize(['admin', 'pharmacist']), updateProduct);
router.delete('/:id', authorize(['admin']), deleteProduct);
router.post('/:id/categories', authorize(['admin', 'pharmacist']), assignCategoryToProduct);
router.delete('/:id/categories/:category', authorize(['admin', 'pharmacist']), removeCategoryFromProduct);

export default router;