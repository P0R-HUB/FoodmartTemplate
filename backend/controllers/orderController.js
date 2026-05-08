const orderService = require('../services/orderService');

// GET /api/orders  — returns all orders for the logged-in user
function getOrders(req, res) {
  try {
    const orders = orderService.getOrdersByEmail(req.user.email);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
}

// GET /api/orders/:id  — returns one order (must belong to logged-in user)
function getOrderById(req, res) {
  try {
    const order = orderService.getOrderById(req.params.id, req.user.email);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
}

module.exports = { getOrders, getOrderById };
