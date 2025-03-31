import express from 'express';
import {
  getAllInventoryItems,
  getInventoryItemById,
  getInventoryByProduct,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addInventoryTransaction,
  getInventoryTransactions,
  getLowStockItems,
  getExpiringItems
} from '../controllers/InventoryController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All inventory routes require authentication
router.use(protect);

// Routes for admin and pharmacist
const staffRoles = ['admin', 'pharmacist', 'staff'];
const adminPharmacistRoles = ['admin', 'pharmacist'];

// Read operations - available to all staff
router.get('/', authorize(staffRoles), getAllInventoryItems);
router.get('/low-stock', authorize(staffRoles), getLowStockItems);
router.get('/expiring', authorize(staffRoles), getExpiringItems);
router.get('/:id', authorize(staffRoles), getInventoryItemById);
router.get('/product/:productId', authorize(staffRoles), getInventoryByProduct);
router.get('/:inventoryItemId/transactions', authorize(staffRoles), getInventoryTransactions);

// Write operations - admin and pharmacist only
router.post('/', authorize(adminPharmacistRoles), createInventoryItem);
router.put('/:id', authorize(adminPharmacistRoles), updateInventoryItem);
router.delete('/:id', authorize(['admin']), deleteInventoryItem);
router.post('/transactions', authorize(adminPharmacistRoles), addInventoryTransaction);

export default router;