import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface Order {
  id: string;
  user_id?: string;
  coupon_id?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address?: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

interface OrderStatus {
  id: string;
  order_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: Date;
}

interface OrderWithDetails extends Order {
  customer_name?: string;
  items: (OrderItem & { product_name?: string })[];
  status: OrderStatus;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

const orderModel = {
  // Get all orders
  async getAllOrders(): Promise<OrderWithDetails[]> {
    const orders = await db('orders').select('*');

    return Promise.all(orders.map(async (order) => {
      return this.getOrderWithDetails(order.id);
    }));
  },

  // Get order by ID with details
  async getOrderById(id: string): Promise<OrderWithDetails | null> {
    const order = await db('orders').where({ id }).first();

    if (!order) return null;

    return this.getOrderWithDetails(id);
  },

  // Get orders by user ID
  async getOrdersByUserId(userId: string): Promise<OrderWithDetails[]> {
    const orders = await db('orders').where({ user_id: userId }).select('*');

    return Promise.all(orders.map(async (order) => {
      return this.getOrderWithDetails(order.id);
    }));
  },

  // Helper method to get order with all details
  async getOrderWithDetails(orderId: string): Promise<OrderWithDetails> {
    const order = await db('orders').where({ id: orderId }).first();

    // Get customer name if user_id exists
    let customerName = undefined;
    if (order.user_id) {
      const user = await db('users').where({ id: order.user_id }).first();
      if (user) {
        customerName = `${user.first_name} ${user.last_name}`;
      }
    }

    // Get order items with product names
    const items = await db('order_items as oi')
      .leftJoin('products as p', 'oi.product_id', 'p.id')
      .where('oi.order_id', orderId)
      .select(
        'oi.*',
        'p.name as product_name'
      );

    // Get latest order status
    const status = await db('order_status')
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc')
      .first();

    // Get latest payment status
    const payment = await db('payments')
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc')
      .first();

    return {
      ...order,
      customer_name: customerName,
      items,
      status: status || { status: 'pending' },
      payment_status: payment?.status
    };
  },

  // Create new order
  async createOrder(
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
    items: Array<Omit<OrderItem, 'id' | 'order_id' | 'created_at'>>,
    initialStatus: Omit<OrderStatus, 'id' | 'order_id' | 'created_at'> = { status: 'pending' }
  ): Promise<string> {
    const orderId = uuidv4();

    await db.transaction(async (trx) => {
      // Insert order
      await trx('orders').insert({
        id: orderId,
        ...orderData
      });

      // Insert order items
      const orderItems = items.map(item => ({
        id: uuidv4(),
        order_id: orderId,
        ...item
      }));

      await trx('order_items').insert(orderItems);

      // Insert initial order status
      await trx('order_status').insert({
        id: uuidv4(),
        order_id: orderId,
        ...initialStatus
      });

      // Update coupon usage if a coupon was used
      if (orderData.coupon_id) {
        await trx('coupons')
          .where({ id: orderData.coupon_id })
          .increment('used_count', 1);
      }

      // Update inventory if needed
      for (const item of items) {
        if (item.product_id) {
          // Find inventory items for this product
          const inventoryItems = await trx('inventory_items')
            .where({ product_id: item.product_id })
            .where('quantity', '>', 0)
            .orderBy('expiry_date', 'asc')
            .select('*');

          let remainingQuantity = item.quantity;

          for (const inventoryItem of inventoryItems) {
            if (remainingQuantity <= 0) break;

            const deductQuantity = Math.min(remainingQuantity, inventoryItem.quantity);

            // Update inventory quantity
            await trx('inventory_items')
              .where({ id: inventoryItem.id })
              .update({
                quantity: inventoryItem.quantity - deductQuantity,
                updated_at: new Date()
              });

            // Add inventory transaction
            await trx('inventory_transactions').insert({
              id: uuidv4(),
              inventory_item_id: inventoryItem.id,
              transaction_type: 'sale',
              quantity: deductQuantity,
              transaction_date: new Date(),
              notes: `Order ${orderId}`
            });

            remainingQuantity -= deductQuantity;
          }

          if (remainingQuantity > 0) {
            throw new Error(`Insufficient inventory for product ${item.product_id}`);
          }
        }
      }
    });

    return orderId;
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    notes?: string
  ): Promise<string> {
    const statusId = uuidv4();

    await db('order_status').insert({
      id: statusId,
      order_id: orderId,
      status,
      notes
    });

    return statusId;
  },

  // Add payment to order
  async addPayment(
    orderId: string,
    paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash' | 'bank_transfer',
    amount: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    transactionId?: string
  ): Promise<string> {
    const paymentId = uuidv4();

    await db('payments').insert({
      id: paymentId,
      order_id: orderId,
      payment_method: paymentMethod,
      amount,
      status,
      transaction_id: transactionId,
      payment_date: new Date()
    });

    return paymentId;
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    await db.transaction(async (trx) => {
      // Add cancelled status
      await trx('order_status').insert({
        id: uuidv4(),
        order_id: orderId,
        status: 'cancelled',
        notes: reason
      });

      // Get order items
      const orderItems = await trx('order_items')
        .where({ order_id: orderId })
        .select('*');

      // Return items to inventory
      for (const item of orderItems) {
        if (item.product_id) {
          // Get first inventory item for this product
          const inventoryItem = await trx('inventory_items')
            .where({ product_id: item.product_id })
            .first();

          if (inventoryItem) {
            // Update inventory quantity
            await trx('inventory_items')
              .where({ id: inventoryItem.id })
              .update({
                quantity: inventoryItem.quantity + item.quantity,
                updated_at: new Date()
              });

            // Add inventory transaction
            await trx('inventory_transactions').insert({
              id: uuidv4(),
              inventory_item_id: inventoryItem.id,
              transaction_type: 'return',
              quantity: item.quantity,
              transaction_date: new Date(),
              notes: `Cancelled order ${orderId}`
            });
          } else {
            // Create new inventory item
            const newInventoryId = uuidv4();

            await trx('inventory_items').insert({
              id: newInventoryId,
              product_id: item.product_id,
              quantity: item.quantity
            });

            // Add inventory transaction
            await trx('inventory_transactions').insert({
              id: uuidv4(),
              inventory_item_id: newInventoryId,
              transaction_type: 'return',
              quantity: item.quantity,
              transaction_date: new Date(),
              notes: `Cancelled order ${orderId}`
            });
          }
        }
      }
    });

    return true;
  },

  // Get order statistics
  async getOrderStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  }> {
    let query = db('orders');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const orders = await query.select('*');

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get order status counts
    const orderIds = orders.map(order => order.id);

    // If no orders in the period, return zeros
    if (orderIds.length === 0) {
      return {
        total_orders: 0,
        total_revenue: 0,
        avg_order_value: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0
      };
    }

    // Get latest status for each order
    const latestStatuses = await db.raw(`
      SELECT DISTINCT ON (order_id) 
        order_id, status
      FROM 
        order_status
      WHERE 
        order_id IN (${orderIds.map(() => '?').join(',')})
      ORDER BY 
        order_id, created_at DESC
    `, orderIds);

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    latestStatuses.rows.forEach((status: { order_id: string, status: string }) => {
      statusCounts[status.status as keyof typeof statusCounts]++;
    });

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      avg_order_value: avgOrderValue,
      pending_orders: statusCounts.pending,
      processing_orders: statusCounts.processing,
      shipped_orders: statusCounts.shipped,
      delivered_orders: statusCounts.delivered,
      cancelled_orders: statusCounts.cancelled
    };
  }
};

export default orderModel;