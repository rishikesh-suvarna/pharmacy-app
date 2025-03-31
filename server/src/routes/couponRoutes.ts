import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/CouponController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// Public route to verify coupon by code
router.get('/code/:code', getCouponByCode);

// Protected routes
router.use(protect);

// Admin-only routes
router.get('/', authorize(['admin']), getAllCoupons);
router.get('/:id', authorize(['admin']), getCouponById);
router.post('/', authorize(['admin']), createCoupon);
router.put('/:id', authorize(['admin']), updateCoupon);
router.delete('/:id', authorize(['admin']), deleteCoupon);

export default router;