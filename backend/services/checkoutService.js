const fs   = require('fs');
const path = require('path');

const ORDERS_PATH   = path.join(__dirname, '../data/orders.json');
const PRODUCTS_PATH = path.join(__dirname, '../data/products.json');

function readOrders() {
  const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeOrders(data) {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getProductById(id) {
  const raw      = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(raw).products;
  return products.find((p) => String(p.id) === String(id)) || null;
}

// Strip HTML tags to prevent XSS before saving to storage
function sanitize(value) {
  return String(value).replace(/<[^>]*>/g, '').trim();
}

function createOrder({ customerName, email, address, cartItems }) {
  const db = readOrders();

  // Recalculate total on server — never trust client-side price
  let serverTotal = 0;
  const verifiedItems = cartItems.map((item) => {
    const product = getProductById(item.id);
    if (!product) throw new Error(`Product ID ${item.id} not found.`);
    const qty     = parseInt(item.qty, 10);
    const price   = parseFloat(product.price);
    serverTotal  += qty * price;
    return { id: product.id, name: product.name, qty, price };
  });

  const newOrder = {
    orderId:      db.orders.length + 1,
    customerName: sanitize(customerName),
    email:        sanitize(email),
    address:      sanitize(address),
    items:        verifiedItems,
    totalPrice:   parseFloat(serverTotal.toFixed(2)),
    status:       'confirmed',
    createdAt:    new Date().toISOString(),
  };

  db.orders.push(newOrder);
  writeOrders(db);
  return newOrder;
}

module.exports = { createOrder };
