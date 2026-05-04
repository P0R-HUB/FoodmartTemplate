const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/auth_user.json');

function readUsersFile() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeUsersFile(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function findUserByEmail(email) {
  const { users } = readUsersFile();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function createUser({ firstName, email, hashedPassword }) {
  const db = readUsersFile();
  const newUser = {
    id: db.users.length + 1,
    firstName,
    email,
    password: hashedPassword,
    registeredAt: new Date().toISOString().split('T')[0],
  };
  db.users.push(newUser);
  writeUsersFile(db);
  return newUser;
}

module.exports = { findUserByEmail, createUser };
