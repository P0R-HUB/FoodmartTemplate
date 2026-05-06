const { db } = require('../database');

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
}

function createUser({ firstName, email, hashedPassword }) {
  const registeredAt = new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO users (firstName, email, password, registeredAt) VALUES (?, ?, ?, ?)'
  ).run(firstName, email, hashedPassword, registeredAt);

  return { id: result.lastInsertRowid, firstName, email, registeredAt };
}

module.exports = { findUserByEmail, createUser };
