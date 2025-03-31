import { Request, Response } from 'express';
import db from '../config/db';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db('categories').select('*');
    res.json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db('categories').where({ id }).first();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await db('categories').where({ name }).first();
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create category
    const [categoryId] = await db('categories').insert({
      name,
      description
    }).returning('id');

    const category = await db('categories').where({ id: categoryId }).first();

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const category = await db('categories').where({ id }).first();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name already exists (if changing name)
    if (name && name !== category.name) {
      const existingCategory = await db('categories').where({ name }).first();
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    // Update category
    await db('categories')
      .where({ id })
      .update({
        name: name || category.name,
        description: description || category.description,
        updated_at: new Date()
      });

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await db('categories').where({ id }).first();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by products
    const productCategories = await db('product_categories').where({ category_id: id }).first();
    if (productCategories) {
      return res.status(400).json({ message: 'Cannot delete category that is being used by products' });
    }

    // Delete category
    await db('categories').where({ id }).delete();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};