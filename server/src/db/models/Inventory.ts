import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: Date;
  created_at: Date;
  updated_at: Date;
}

interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  supplier_id?: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  unit_cost?: number;
  transaction_date: Date;
  notes?: string;
  created_at: Date;
}

interface InventoryWithProduct extends InventoryItem {
  product_name: string;
  product_sku: string;
}

const inventoryModel = {
  // Get all inventory items
  async getAllInventoryItems(): Promise<InventoryWithProduct[]> {
    return db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .select(
        'ii.*',
        'p.name as product_name',
        'p.sku as product_sku'
      );
  },

  // Get inventory item by ID
  async getInventoryItemById(id: string): Promise<InventoryWithProduct | null> {
    const item = await db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .where('ii.id', id)
      .select(
        'ii.*',
        'p.name as product_name',
        'p.sku as product_sku'
      )
      .first();

    return item || null;
  },

  // Get inventory by product ID
  async getInventoryByProductId(productId: string): Promise<InventoryWithProduct[]> {
    return db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .where('ii.product_id', productId)
      .select(
        'ii.*',
        'p.name as product_name',
        'p.sku as product_sku'
      );
  },

  // Create new inventory item
  async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = uuidv4();

    const [itemId] = await db('inventory_items').insert({
      id,
      ...itemData
    }).returning('id');

    return itemId;
  },

  // Update inventory item
  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<boolean> {
    const updated = await db('inventory_items')
      .where({ id })
      .update({
        ...itemData,
        updated_at: new Date()
      });

    return updated > 0;
  },

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<boolean> {
    const deleted = await db('inventory_items').where({ id }).delete();
    return deleted > 0;
  },

  // Add inventory transaction
  async addInventoryTransaction(transactionData: Omit<InventoryTransaction, 'id' | 'created_at'>): Promise<string> {
    const id = uuidv4();

    // Get the current inventory item
    const inventoryItem = await db('inventory_items')
      .where({ id: transactionData.inventory_item_id })
      .first();

    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    // Update inventory quantity based on transaction type
    let newQuantity = inventoryItem.quantity;

    if (transactionData.transaction_type === 'purchase' || transactionData.transaction_type === 'return') {
      newQuantity += transactionData.quantity;
    } else if (transactionData.transaction_type === 'sale' || transactionData.transaction_type === 'adjustment') {
      newQuantity -= transactionData.quantity;

      // Check if we have enough inventory
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory');
      }
    }

    // Start a transaction
    await db.transaction(async (trx) => {
      // Add transaction record
      await trx('inventory_transactions').insert({
        id,
        ...transactionData
      });

      // Update inventory quantity
      await trx('inventory_items')
        .where({ id: transactionData.inventory_item_id })
        .update({
          quantity: newQuantity,
          updated_at: new Date()
        });
    });

    return id;
  },

  // Get inventory transactions
  async getInventoryTransactions(inventoryItemId: string): Promise<InventoryTransaction[]> {
    return db('inventory_transactions')
      .where({ inventory_item_id: inventoryItemId })
      .orderBy('transaction_date', 'desc');
  },

  // Get low stock items (less than threshold)
  async getLowStockItems(threshold: number = 10): Promise<InventoryWithProduct[]> {
    return db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .where('ii.quantity', '<', threshold)
      .select(
        'ii.*',
        'p.name as product_name',
        'p.sku as product_sku'
      );
  },

  // Get expiring items (within days from now)
  async getExpiringItems(days: number = 90): Promise<InventoryWithProduct[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .whereNotNull('ii.expiry_date')
      .andWhere('ii.expiry_date', '<=', futureDate)
      .andWhere('ii.expiry_date', '>=', new Date())
      .select(
        'ii.*',
        'p.name as product_name',
        'p.sku as product_sku'
      );
  }
};

export default inventoryModel;