const productService = require('../services/productService');

function getProducts(req, res) {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    const products = productService.getAllProducts({ category, minPrice, maxPrice, sort });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

function getProductById(req, res) {
  try {
    const product = productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve product.' });
  }
}

function getCategories(req, res) {
  try {
    const categories = productService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

module.exports = { getProducts, getProductById, getCategories };
