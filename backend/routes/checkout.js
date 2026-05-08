const express            = require('express');
const router             = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { requireAuth }    = require('../middleware/auth');

// POST /api/checkout  — requires login
router.post('/', requireAuth, checkoutController.checkout);

module.exports = router;
