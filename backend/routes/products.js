const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products?category=Electronics&minPrice=20&maxPrice=100&sort=price_asc
router.get('/', productController.getProducts);

// GET /api/products/categories
router.get('/categories', productController.getCategories);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

module.exports = router;
