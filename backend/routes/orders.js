const express          = require('express');
const router           = express.Router();
const orderController  = require('../controllers/orderController');
const { requireAuth }  = require('../middleware/auth');

// All order routes require login
router.get('/',    requireAuth, orderController.getOrders);
router.get('/:id', requireAuth, orderController.getOrderById);

module.exports = router;
