import { Request, Response } from 'express';
import db from '../config/db';
import orderModel from '../db/models/Order';
import inventoryModel from '../db/models/Inventory';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get date ranges
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Current month and previous month order stats
    const currentMonthStats = await orderModel.getOrderStats(startOfMonth);
    const previousMonthStats = await orderModel.getOrderStats(startOfLastMonth, endOfLastMonth);

    // Low stock items
    const lowStockItems = await inventoryModel.getLowStockItems(10);

    // Expiring items within 30 days
    const expiringItems = await inventoryModel.getExpiringItems(30);

    // Get total number of products, users, and suppliers
    const [
      { count: totalProducts = 0 } = db('products').count('* as count').first() || {},
      { count: totalUsers = 0 } = db('users').count('* as count').first() || {},
      { count: totalSuppliers = 0 } = db('suppliers').count('* as count').first() || {}
    ] = await Promise.all([
      db('products').count('* as count').first(),
      db('users').count('* as count').first(),
      db('suppliers').count('* as count').first()
    ]);

    // Revenue comparison with previous month
    const revenueChange = previousMonthStats.total_revenue > 0
      ? ((currentMonthStats.total_revenue - previousMonthStats.total_revenue) / previousMonthStats.total_revenue) * 100
      : 100;

    // Order count comparison with previous month
    const orderCountChange = previousMonthStats.total_orders > 0
      ? ((currentMonthStats.total_orders - previousMonthStats.total_orders) / previousMonthStats.total_orders) * 100
      : 100;

    res.json({
      revenue: {
        current: currentMonthStats.total_revenue,
        previous: previousMonthStats.total_revenue,
        change: revenueChange
      },
      orders: {
        current: currentMonthStats.total_orders,
        previous: previousMonthStats.total_orders,
        change: orderCountChange,
        pending: currentMonthStats.pending_orders,
        processing: currentMonthStats.processing_orders,
        shipped: currentMonthStats.shipped_orders,
        delivered: currentMonthStats.delivered_orders,
        cancelled: currentMonthStats.cancelled_orders
      },
      inventory: {
        lowStock: lowStockItems.length,
        expiringSoon: expiringItems.length,
        lowStockItems: lowStockItems.slice(0, 5), // Top 5 low stock items
        expiringItems: expiringItems.slice(0, 5) // Top 5 expiring items
      },
      counts: {
        products: parseInt(totalProducts as string),
        users: parseInt(totalUsers as string),
        suppliers: parseInt(totalSuppliers as string)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, interval } = req.query;

    const startDate = start_date ? new Date(start_date as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const groupByInterval = interval === 'weekly' ? 'week' : interval === 'monthly' ? 'month' : 'day';

    // Use raw SQL for more flexibility with date formatting and grouping
    let query;

    if (groupByInterval === 'day') {
      query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total) as total_sales
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
    } else if (groupByInterval === 'week') {
      query = `
        SELECT 
          DATE_TRUNC('week', created_at) as date,
          COUNT(*) as order_count,
          SUM(total) as total_sales
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY date
      `;
    } else { // month
      query = `
        SELECT 
          DATE_TRUNC('month', created_at) as date,
          COUNT(*) as order_count,
          SUM(total) as total_sales
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY date
      `;
    }

    const result = await db.raw(query, [startDate, endDate]);

    // Calculate total and average
    const totalSales = result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.total_sales), 0);
    const totalOrders = result.rows.reduce((sum: number, row: any) => sum + parseInt(row.order_count), 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    res.json({
      data: result.rows,
      summary: {
        total_sales: totalSales,
        total_orders: totalOrders,
        avg_order_value: avgOrderValue,
        start_date: startDate,
        end_date: endDate,
        interval: groupByInterval
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductSalesReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, limit } = req.query;

    const startDate = start_date ? new Date(start_date as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const resultLimit = limit ? parseInt(limit as string) : 10;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sales DESC
      LIMIT ?
    `;

    const result = await db.raw(query, [startDate, endDate, resultLimit]);

    res.json({
      data: result.rows,
      summary: {
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    console.error('Get product sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    // Get all inventory items with product details
    const inventoryItems = await db('inventory_items as ii')
      .join('products as p', 'ii.product_id', 'p.id')
      .select(
        'ii.id',
        'p.id as product_id',
        'p.name',
        'p.sku',
        'ii.quantity',
        'ii.batch_number',
        'ii.expiry_date'
      )
      .orderBy('p.name');

    // Calculate inventory values
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventoryItems.filter(item => item.quantity < 10).length;

    // Get items expiring in the next 90 days
    const now = new Date();
    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(now.getDate() + 90);

    const expiringItems = inventoryItems.filter(
      item => item.expiry_date && new Date(item.expiry_date) > now && new Date(item.expiry_date) < ninetyDaysLater
    ).length;

    // Group by product category
    const productCategories = await db('product_categories as pc')
      .join('categories as c', 'pc.category_id', 'c.id')
      .join('products as p', 'pc.product_id', 'p.id')
      .join('inventory_items as ii', 'p.id', 'ii.product_id')
      .select(
        'c.name as category',
        db.raw('SUM(ii.quantity) as total_quantity')
      )
      .groupBy('c.name')
      .orderBy('total_quantity', 'desc');

    res.json({
      data: inventoryItems,
      summary: {
        total_items: totalItems,
        total_products: inventoryItems.length,
        low_stock_items: lowStockItems,
        expiring_items: expiringItems
      },
      categories: productCategories
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};