import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await db('suppliers').select('*');
    res.json(suppliers);
  } catch (error) {
    console.error('Get all suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await db('suppliers').where({ id }).first();

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;

    const id = uuidv4();

    // Create supplier
    await db('suppliers').insert({
      id,
      name,
      contact_person,
      email,
      phone,
      address
    });

    const supplier = await db('suppliers').where({ id }).first();

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, address } = req.body;

    // Check if supplier exists
    const supplier = await db('suppliers').where({ id }).first();
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Update supplier
    await db('suppliers')
      .where({ id })
      .update({
        name,
        contact_person,
        email,
        phone,
        address,
        updated_at: new Date()
      });

    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const supplier = await db('suppliers').where({ id }).first();
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check if supplier is being used in inventory transactions
    const transactions = await db('inventory_transactions').where({ supplier_id: id }).first();
    if (transactions) {
      return res.status(400).json({ message: 'Cannot delete supplier that is associated with inventory transactions' });
    }

    // Delete supplier
    await db('suppliers').where({ id }).delete();

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSupplierTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const supplier = await db('suppliers').where({ id }).first();
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Get transactions with inventory item and product details
    const transactions = await db('inventory_transactions as it')
      .join('inventory_items as ii', 'it.inventory_item_id', 'ii.id')
      .join('products as p', 'ii.product_id', 'p.id')
      .where('it.supplier_id', id)
      .select(
        'it.*',
        'p.name as product_name',
        'p.sku as product_sku',
        'ii.batch_number',
        'ii.expiry_date'
      )
      .orderBy('it.transaction_date', 'desc');

    res.json(transactions);
  } catch (error) {
    console.error('Get supplier transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};