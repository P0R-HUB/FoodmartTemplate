const { db } = require('../database');

function sanitize(value) {
  return String(value).replace(/<[^>]*>/g, '').trim();
}

function createOrder({ customerName, email, address, cartItems }) {
  // Recalculate total on server — never trust client-side price
  let serverTotal    = 0;
  const verifiedItems = cartItems.map((item) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
    if (!product) throw new Error(`Product ID ${item.id} not found.`);
    const qty    = parseInt(item.qty, 10);
    const price  = parseFloat(product.price);
    serverTotal += qty * price;
    return { id: product.id, name: product.name, qty, price };
  });

  const totalPrice = parseFloat(serverTotal.toFixed(2));
  const createdAt  = new Date().toISOString();

  // ── Atomic transaction: insert order + all items together ─────────────────
  const insertOrder = db.prepare(
    'INSERT INTO orders (customerName, email, address, totalPrice, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (orderId, productId, productName, qty, price) VALUES (?, ?, ?, ?, ?)'
  );

  const placeOrder = db.transaction(() => {
    const result = insertOrder.run(
      sanitize(customerName),
      sanitize(email),
      sanitize(address),
      totalPrice,
      'confirmed',
      createdAt
    );
    const orderId = result.lastInsertRowid;

    for (const item of verifiedItems) {
      insertItem.run(orderId, item.id, item.name, item.qty, item.price);
    }

    return orderId;
  });

  const orderId = placeOrder();
  return { orderId, totalPrice, createdAt };
}

module.exports = { createOrder };
