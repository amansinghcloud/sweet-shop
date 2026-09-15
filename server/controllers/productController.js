const { run, get, all } = require('../config/db');

// Get all products with search, category filter, and sorting
const getAllProducts = async (req, res) => {
  try {
    const { category, search, bestseller, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(ingredients) LIKE ?)';
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    if (bestseller === 'true' || bestseller === '1') {
      query += ' AND is_bestseller = 1';
    }

    // Sorting
    if (sort === 'price-low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const rows = await all(query, params);

    const formatted = rows.map(p => ({
      ...p,
      is_bestseller: Boolean(p.is_bestseller),
      weight_options: JSON.parse(p.weight_options || '["250g", "500g", "1kg"]')
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

// Get single product by ID with reviews
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sweet not found.' });
    }

    const reviews = await all(
      'SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );

    const formatted = {
      ...product,
      is_bestseller: Boolean(product.is_bestseller),
      weight_options: JSON.parse(product.weight_options || '["250g", "500g", "1kg"]'),
      reviews
    };

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

// Create product (Admin)
const createProduct = async (req, res) => {
  try {
    const { name, category, price, weight_options, description, ingredients, shelf_life, image, is_bestseller, stock } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    const weightsStr = Array.isArray(weight_options) 
      ? JSON.stringify(weight_options) 
      : JSON.stringify(['250g', '500g', '1kg']);

    const defaultImg = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80';

    const result = await run(
      `INSERT INTO products (name, category, price, weight_options, description, ingredients, shelf_life, image, is_bestseller, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category.toLowerCase(),
        Number(price),
        weightsStr,
        description || '',
        ingredients || 'Pure Desi Ghee, Traditional Ingredients',
        shelf_life || '15 Days',
        image || defaultImg,
        is_bestseller ? 1 : 0,
        stock ? Number(stock) : 50
      ]
    );

    res.status(201).json({
      success: true,
      message: 'New sweet added to menu successfully!',
      productId: result.id
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Failed to add product.' });
  }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, stock, is_bestseller, image } = req.body;

    const existing = await get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sweet not found.' });
    }

    await run(
      `UPDATE products SET 
         name = COALESCE(?, name),
         category = COALESCE(?, category),
         price = COALESCE(?, price),
         description = COALESCE(?, description),
         stock = COALESCE(?, stock),
         is_bestseller = COALESCE(?, is_bestseller),
         image = COALESCE(?, image)
       WHERE id = ?`,
      [
        name,
        category ? category.toLowerCase() : null,
        price ? Number(price) : null,
        description,
        stock !== undefined ? Number(stock) : null,
        is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : null,
        image,
        id
      ]
    );

    res.json({ success: true, message: 'Sweet updated successfully.' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM products WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Sweet not found.' });
    }
    res.json({ success: true, message: 'Sweet removed from catalog.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// Add product review
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, rating, comment } = req.body;

    if (!user_name || !rating) {
      return res.status(400).json({ success: false, message: 'Name and rating are required.' });
    }

    const product = await get('SELECT id, rating, reviews_count FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sweet not found.' });
    }

    await run(
      'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [id, user_name, Number(rating), comment || '']
    );

    // Recalculate average rating
    const newCount = product.reviews_count + 1;
    const newAvg = Number(((product.rating * product.reviews_count + Number(rating)) / newCount).toFixed(1));

    await run(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [newAvg, newCount, id]
    );

    res.status(201).json({
      success: true,
      message: 'Review posted! Thank you for your feedback.',
      rating: newAvg,
      reviews_count: newCount
    });
  } catch (err) {
    console.error('Error posting review:', err);
    res.status(500).json({ success: false, message: 'Failed to post review.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
};
