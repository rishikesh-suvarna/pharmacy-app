import { Request, Response } from 'express';
import productModel from '../db/models/Product';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      sku,
      price,
      image_url,
      prescription_required,
      categories
    } = req.body;

    // Create product
    const productId = await productModel.createProduct({
      name,
      description,
      sku,
      price,
      image_url,
      prescription_required: prescription_required || false,
      active: true
    });

    // Assign categories if provided
    if (categories && Array.isArray(categories)) {
      for (const category of categories) {
        await productModel.assignCategoryToProduct(productId, category);
      }
    }

    // Get the created product with categories
    const product = await productModel.getProductById(productId);

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      sku,
      price,
      image_url,
      prescription_required,
      active
    } = req.body;

    // Check if product exists
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product
    const updated = await productModel.updateProduct(id, {
      name,
      description,
      sku,
      price,
      image_url,
      prescription_required,
      active
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update product' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product
    const deleted = await productModel.deleteProduct(id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete product' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.categories);
  } catch (error) {
    console.error('Get product categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignCategoryToProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    // Check if product exists
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if category exists
    const categoryExists = await db('categories').where({ name: category }).first();
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Assign category
    const assigned = await productModel.assignCategoryToProduct(id, category);

    if (!assigned) {
      return res.status(400).json({ message: 'Failed to assign category' });
    }

    res.json({ message: `Category ${category} assigned successfully` });
  } catch (error) {
    console.error('Assign category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeCategoryFromProduct = async (req: Request, res: Response) => {
  try {
    const { id, category } = req.params;

    // Check if product exists
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove category
    const removed = await productModel.removeCategoryFromProduct(id, category);

    if (!removed) {
      return res.status(400).json({ message: 'Product does not have this category' });
    }

    res.json({ message: `Category ${category} removed successfully` });
  } catch (error) {
    console.error('Remove category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    // Check if category exists
    const categoryExists = await db('categories').where({ name: category }).first();
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get products
    const products = await productModel.getProductsByCategory(category);

    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await productModel.searchProducts(query);

    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};