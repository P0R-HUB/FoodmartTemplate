const { db } = require('../database');

function getOrdersByEmail(email) {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE LOWER(email) = LOWER(?) ORDER BY createdAt DESC'
  ).all(email);

  return orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    return { ...order, items };
  });
}

function getOrderById(id, email) {
  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND LOWER(email) = LOWER(?)'
  ).get(id, email);
  if (!order) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  return { ...order, items };
}

module.exports = { getOrdersByEmail, getOrderById };
