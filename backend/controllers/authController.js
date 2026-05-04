const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'foodmart-secret-key';
const SALT_ROUNDS = 10;

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Step 1: find user — use a vague error so we don't leak whether the email exists
    const user = authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Step 2: compare submitted password with stored hash (never decrypt — only compare)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Step 3: sign JWT — payload contains only non-sensitive data
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, firstName: user.firstName, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Backend password validation (mirrors frontend rules — backend is the real gatekeeper)
    const passwordRules = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{8,})$/;
    if (!passwordRules.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters, include one uppercase letter and one special character (!@#$%^&*).',
      });
    }

    // Check for duplicate email
    const existing = authService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password before storing — never store plain text
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = authService.createUser({ firstName, email, hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: { id: newUser.id, firstName: newUser.firstName, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}

module.exports = { login, register };
