const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH       = path.join(__dirname, 'store.db');
const USERS_JSON    = path.join(__dirname, 'data/auth_user.json');
const PRODUCTS_JSON = path.join(__dirname, 'data/products.json');

const db = new Database(DB_PATH);

// Enable foreign key enforcement
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  // ── Create tables ──────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName     TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password      TEXT    NOT NULL,
      registeredAt  TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY,
      name        TEXT    NOT NULL,
      price       REAL    NOT NULL,
      image       TEXT,
      category    TEXT,
      description TEXT,
      rating      REAL    DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT    NOT NULL,
      email        TEXT    NOT NULL,
      address      TEXT    NOT NULL,
      totalPrice   REAL    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'confirmed',
      createdAt    TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId     INTEGER NOT NULL,
      productId   TEXT    NOT NULL,
      productName TEXT    NOT NULL,
      qty         INTEGER NOT NULL,
      price       REAL    NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

  // ── Seed users from JSON (only if table is empty) ─────────────────────────
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const { users } = JSON.parse(fs.readFileSync(USERS_JSON, 'utf-8'));
    const insertUser = db.prepare(
      'INSERT INTO users (id, firstName, email, password, registeredAt) VALUES (?, ?, ?, ?, ?)'
    );
    const seedUsers = db.transaction((rows) => {
      for (const u of rows) {
        insertUser.run(u.id, u.firstName, u.email, u.password, u.registeredAt);
      }
    });
    seedUsers(users);
    console.log(`[DB] Seeded ${users.length} users.`);
  }

  // ── Seed products from JSON (only if table is empty) ──────────────────────
  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (productCount === 0) {
    const { products } = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
    const insertProduct = db.prepare(
      'INSERT INTO products (id, name, price, image, category, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const seedProducts = db.transaction((rows) => {
      for (const p of rows) {
        insertProduct.run(p.id, p.name, p.price, p.image, p.category, p.description, p.rating);
      }
    });
    seedProducts(products);
    console.log(`[DB] Seeded ${products.length} products.`);
  }

  console.log('[DB] SQLite ready →', DB_PATH);
}

module.exports = { db, init };
