const { db } = require('../database');

function getOrdersByUserId(userId) {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC'
  ).all(userId);

  return orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    return { ...order, items };
  });
}

function getOrderById(id, userId) {
  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND userId = ?'
  ).get(id, userId);
  if (!order) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  return { ...order, items };
}

module.exports = { getOrdersByUserId, getOrderById };
