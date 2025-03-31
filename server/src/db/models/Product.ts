import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  image_url?: string;
  prescription_required: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProductWithCategories extends Product {
  categories: string[];
}

const productModel = {
  // Get all products
  async getAllProducts(): Promise<ProductWithCategories[]> {
    const products = await db('products').select('*');

    const productsWithCategories = await Promise.all(products.map(async (product) => {
      const categories = await db('categories')
        .join('product_categories', 'categories.id', 'product_categories.category_id')
        .where('product_categories.product_id', product.id)
        .pluck('categories.name');

      return { ...product, categories };
    }));

    return productsWithCategories;
  },

  // Get product by ID
  async getProductById(id: string): Promise<ProductWithCategories | null> {
    const product = await db('products').where({ id }).first();

    if (!product) return null;

    const categories = await db('categories')
      .join('product_categories', 'categories.id', 'product_categories.category_id')
      .where('product_categories.product_id', id)
      .pluck('categories.name');

    return { ...product, categories };
  },

  // Create new product
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = uuidv4();

    const [productId] = await db('products').insert({
      id,
      ...productData
    }).returning('id');

    return productId;
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
    const updated = await db('products')
      .where({ id })
      .update({
        ...productData,
        updated_at: new Date()
      });

    return updated > 0;
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    const deleted = await db('products').where({ id }).delete();
    return deleted > 0;
  },

  // Assign category to product
  async assignCategoryToProduct(productId: string, categoryName: string): Promise<boolean> {
    // Find category ID
    const category = await db('categories').where({ name: categoryName }).first();
    if (!category) return false;

    // Check if category is already assigned
    const existingCategory = await db('product_categories')
      .where({
        product_id: productId,
        category_id: category.id
      })
      .first();

    if (existingCategory) return true;

    // Assign category
    await db('product_categories').insert({
      id: uuidv4(),
      product_id: productId,
      category_id: category.id
    });

    return true;
  },

  // Remove category from product
  async removeCategoryFromProduct(productId: string, categoryName: string): Promise<boolean> {
    // Find category ID
    const category = await db('categories').where({ name: categoryName }).first();
    if (!category) return false;

    // Remove category
    const removed = await db('product_categories')
      .where({
        product_id: productId,
        category_id: category.id
      })
      .delete();

    return removed > 0;
  },

  // Get products by category
  async getProductsByCategory(categoryName: string): Promise<ProductWithCategories[]> {
    const productIds = await db('categories')
      .join('product_categories', 'categories.id', 'product_categories.category_id')
      .where('categories.name', categoryName)
      .pluck('product_categories.product_id');

    if (productIds.length === 0) return [];

    const products = await db('products')
      .whereIn('id', productIds)
      .select('*');

    const productsWithCategories = await Promise.all(products.map(async (product) => {
      const categories = await db('categories')
        .join('product_categories', 'categories.id', 'product_categories.category_id')
        .where('product_categories.product_id', product.id)
        .pluck('categories.name');

      return { ...product, categories };
    }));

    return productsWithCategories;
  },

  // Search products
  async searchProducts(query: string): Promise<ProductWithCategories[]> {
    const products = await db('products')
      .where('name', 'ilike', `%${query}%`)
      .orWhere('description', 'ilike', `%${query}%`)
      .orWhere('sku', 'ilike', `%${query}%`)
      .select('*');

    const productsWithCategories = await Promise.all(products.map(async (product) => {
      const categories = await db('categories')
        .join('product_categories', 'categories.id', 'product_categories.category_id')
        .where('product_categories.product_id', product.id)
        .pluck('categories.name');

      return { ...product, categories };
    }));

    return productsWithCategories;
  }
};

export default productModel;