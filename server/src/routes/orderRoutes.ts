import express from 'express';
import {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  addOrderPayment,
  cancelOrder,
  getOrderStats
} from '../controllers/OrderController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Customer routes
router.get('/my-orders', getMyOrders);
router.post('/', createOrder);

// Staff routes
const staffRoles = ['admin', 'pharmacist', 'staff'];
router.get('/', authorize(staffRoles), getAllOrders);
router.get('/stats', authorize(staffRoles), getOrderStats);
router.get('/:id', authorize(staffRoles), getOrderById);
router.post('/:id/status', authorize(staffRoles), updateOrderStatus);
router.post('/:id/payments', authorize(staffRoles), addOrderPayment);

// Cancel order - admin, pharmacist, or the order owner
router.post('/:id/cancel', async (req, res, next) => {
  try {
    // Get the order to check ownership
    const id = req.params.id;
    const order = await req.app.locals.db('orders').where({ id }).first();

    // Allow if user is admin or pharmacist
    if (req.user && (req.user.roles.includes('admin') || req.user.roles.includes('pharmacist'))) {
      return next();
    }

    // Allow if user is the order owner
    if (req.user && order && order.user_id === req.user.id) {
      return next();
    }

    // Otherwise, unauthorized
    return res.status(403).json({
      message: 'Forbidden: You do not have permission to cancel this order'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}, cancelOrder);

export default router;