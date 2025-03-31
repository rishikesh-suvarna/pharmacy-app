import express from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierTransactions
} from '../controllers/SupplierController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All supplier routes require authentication
router.use(protect);

// Staff can view
const staffRoles = ['admin', 'pharmacist', 'staff'];
router.get('/', authorize(staffRoles), getAllSuppliers);
router.get('/:id', authorize(staffRoles), getSupplierById);
router.get('/:id/transactions', authorize(staffRoles), getSupplierTransactions);

// Admin and pharmacist can modify
const adminPharmacistRoles = ['admin', 'pharmacist'];
router.post('/', authorize(adminPharmacistRoles), createSupplier);
router.put('/:id', authorize(adminPharmacistRoles), updateSupplier);
router.delete('/:id', authorize(['admin']), deleteSupplier);

export default router;