import { Request, Response } from 'express';
import orderModel from '../db/models/Order';
import db from '../config/db';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const orders = await orderModel.getOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      coupon_id,
      subtotal,
      tax,
      discount,
      total,
      shipping_address,
      items,
      status,
      payment
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Create order
    try {
      const orderId = await orderModel.createOrder(
        {
          user_id: user_id || (req.user ? req.user.id : undefined),
          coupon_id,
          subtotal,
          tax,
          discount,
          total,
          shipping_address
        },
        items,
        { status: status || 'pending' }
      );

      // Add payment if provided
      if (payment) {
        await orderModel.addPayment(
          orderId,
          payment.payment_method,
          payment.amount,
          payment.status,
          payment.transaction_id
        );
      }

      const order = await orderModel.getOrderById(orderId);

      res.status(201).json(order);
    } catch (err: any) {
      if (err.message && err.message.includes('Insufficient inventory')) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if order exists
    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    await orderModel.updateOrderStatus(id, status, notes);

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addOrderPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_method, amount, status, transaction_id } = req.body;

    // Check if order exists
    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add payment
    const paymentId = await orderModel.addPayment(
      id,
      payment_method,
      amount,
      status,
      transaction_id
    );

    res.status(201).json({ id: paymentId, message: 'Payment added successfully' });
  } catch (error) {
    console.error('Add order payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if order exists
    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.status.status === 'delivered' || order.status.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status.status}` });
    }

    // Cancel order
    await orderModel.cancelOrder(id, reason);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const stats = await orderModel.getOrderStats(startDate, endDate);

    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};