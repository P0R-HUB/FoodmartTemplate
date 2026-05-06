const express            = require('express');
const router             = express.Router();
const checkoutController = require('../controllers/checkoutController');

// POST /api/checkout
router.post('/', checkoutController.checkout);

module.exports = router;
