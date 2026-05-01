const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/products.json');

function readProductsFile() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw).products;
}

function getAllProducts({ category, minPrice, maxPrice, sort } = {}) {
  let products = readProductsFile();

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice !== undefined) {
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  }

  if (maxPrice !== undefined) {
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);

  return products;
}

function getProductById(id) {
  const products = readProductsFile();
  return products.find((p) => p.id === parseInt(id)) || null;
}

function getCategories() {
  const products = readProductsFile();
  return [...new Set(products.map((p) => p.category))].sort();
}

module.exports = { getAllProducts, getProductById, getCategories };
