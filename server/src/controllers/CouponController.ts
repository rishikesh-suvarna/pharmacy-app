import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await db('coupons').select('*');
    res.json(coupons);
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCouponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await db('coupons').where({ id }).first();

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Get coupon by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCouponByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const coupon = await db('coupons').where({ code }).first();

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is active
    if (!coupon.active) {
      return res.status(400).json({ message: 'Coupon is inactive' });
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ message: 'Coupon is not yet valid' });
    }

    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if coupon usage limit has been reached
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Get coupon by code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discount_amount,
      discount_percentage,
      usage_limit,
      valid_from,
      valid_to,
      active
    } = req.body;

    // Check if code already exists
    const existingCoupon = await db('coupons').where({ code }).first();
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create coupon
    const id = uuidv4();

    await db('coupons').insert({
      id,
      code,
      description,
      discount_amount: discount_amount || 0,
      discount_percentage: discount_percentage || 0,
      usage_limit: usage_limit || null,
      used_count: 0,
      valid_from: valid_from ? new Date(valid_from) : null,
      valid_to: valid_to ? new Date(valid_to) : null,
      active: active !== undefined ? active : true
    });

    const coupon = await db('coupons').where({ id }).first();

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discount_amount,
      discount_percentage,
      usage_limit,
      valid_from,
      valid_to,
      active
    } = req.body;

    // Check if coupon exists
    const coupon = await db('coupons').where({ id }).first();
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if code is being changed and already exists
    if (code && code !== coupon.code) {
      const existingCoupon = await db('coupons').where({ code }).first();
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // Update coupon
    await db('coupons')
      .where({ id })
      .update({
        code: code || coupon.code,
        description: description !== undefined ? description : coupon.description,
        discount_amount: discount_amount !== undefined ? discount_amount : coupon.discount_amount,
        discount_percentage: discount_percentage !== undefined ? discount_percentage : coupon.discount_percentage,
        usage_limit: usage_limit !== undefined ? usage_limit : coupon.usage_limit,
        valid_from: valid_from ? new Date(valid_from) : coupon.valid_from,
        valid_to: valid_to ? new Date(valid_to) : coupon.valid_to,
        active: active !== undefined ? active : coupon.active,
        updated_at: new Date()
      });

    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const coupon = await db('coupons').where({ id }).first();
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is being used in any orders
    const orders = await db('orders').where({ coupon_id: id }).first();
    if (orders) {
      return res.status(400).json({ message: 'Cannot delete coupon that is being used in orders' });
    }

    // Delete coupon
    await db('coupons').where({ id }).delete();

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};