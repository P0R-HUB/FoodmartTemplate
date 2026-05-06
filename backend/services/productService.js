const { db } = require('../database');

function getAllProducts({ category, minPrice, maxPrice, sort } = {}) {
  let query  = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }
  if (minPrice !== undefined) {
    query += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice !== undefined) {
    query += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (sort === 'price_asc')  query += ' ORDER BY price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price DESC';
  else if (sort === 'rating')     query += ' ORDER BY rating DESC';

  return db.prepare(query).all(...params);
}

function getProductById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id) || null;
}

function getCategories() {
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  return rows.map((r) => r.category);
}

module.exports = { getAllProducts, getProductById, getCategories };
