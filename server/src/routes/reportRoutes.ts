import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getProductSalesReport,
  getInventoryReport
} from '../controllers/ReportController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All report routes require authentication
router.use(protect);

// Only admin, pharmacist and staff can access reports
const staffRoles = ['admin', 'pharmacist', 'staff'];

router.get('/dashboard', authorize(staffRoles), getDashboardStats);
router.get('/sales', authorize(staffRoles), getSalesReport);
router.get('/products', authorize(staffRoles), getProductSalesReport);
router.get('/inventory', authorize(staffRoles), getInventoryReport);

export default router;