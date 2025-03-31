import { Request, Response } from 'express';
import inventoryModel from '../db/models/Inventory';
import productModel from '../db/models/Product';

export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const inventoryItems = await inventoryModel.getAllInventoryItems();
    res.json(inventoryItems);
  } catch (error) {
    console.error('Get all inventory items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventoryItem = await inventoryModel.getInventoryItemById(id);

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error('Get inventory item by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventoryItems = await inventoryModel.getInventoryByProductId(productId);

    res.json(inventoryItems);
  } catch (error) {
    console.error('Get inventory by product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, batch_number, expiry_date } = req.body;

    // Check if product exists
    const product = await productModel.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create inventory item
    const itemId = await inventoryModel.createInventoryItem({
      product_id,
      quantity,
      batch_number,
      expiry_date: expiry_date ? new Date(expiry_date) : undefined
    });

    const inventoryItem = await inventoryModel.getInventoryItemById(itemId);

    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, batch_number, expiry_date } = req.body;

    // Check if inventory item exists
    const inventoryItem = await inventoryModel.getInventoryItemById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update inventory item
    const updated = await inventoryModel.updateInventoryItem(id, {
      quantity,
      batch_number,
      expiry_date: expiry_date ? new Date(expiry_date) : undefined
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update inventory item' });
    }

    res.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if inventory item exists
    const inventoryItem = await inventoryModel.getInventoryItemById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Delete inventory item
    const deleted = await inventoryModel.deleteInventoryItem(id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete inventory item' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInventoryTransaction = async (req: Request, res: Response) => {
  try {
    const {
      inventory_item_id,
      supplier_id,
      transaction_type,
      quantity,
      unit_cost,
      notes
    } = req.body;

    // Check if inventory item exists
    const inventoryItem = await inventoryModel.getInventoryItemById(inventory_item_id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Add transaction
    try {
      const transactionId = await inventoryModel.addInventoryTransaction({
        inventory_item_id,
        supplier_id,
        transaction_type,
        quantity,
        unit_cost,
        transaction_date: new Date(),
        notes
      });

      res.status(201).json({ id: transactionId, message: 'Transaction added successfully' });
    } catch (err: any) {
      if (err.message === 'Insufficient inventory') {
        return res.status(400).json({ message: 'Insufficient inventory for this transaction' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Add inventory transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryTransactions = async (req: Request, res: Response) => {
  try {
    const { inventoryItemId } = req.params;

    // Check if inventory item exists
    const inventoryItem = await inventoryModel.getInventoryItemById(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Get transactions
    const transactions = await inventoryModel.getInventoryTransactions(inventoryItemId);

    res.json(transactions);
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;

    const lowStockItems = await inventoryModel.getLowStockItems(threshold);

    res.json(lowStockItems);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExpiringItems = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 90;

    const expiringItems = await inventoryModel.getExpiringItems(days);

    res.json(expiringItems);
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};