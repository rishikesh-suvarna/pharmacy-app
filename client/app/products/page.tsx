'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    // Fetch categories
    axios.get('http://localhost:8080/api/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));

    // Fetch products
    axios.get('http://localhost:8080/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === parseInt(selectedCategory))
    : products;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Products</h1>
      <div className="mb-4">
        <label htmlFor="category" className="block text-lg font-medium mb-2">Filter by Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="block w-full p-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="mb-2">{product.description}</p>
            <p className="mb-2">Price: ${product.price}</p>
            <p className="mb-2">Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;