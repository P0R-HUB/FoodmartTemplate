const express          = require('express');
const cors             = require('cors');
const productRoutes    = require('./routes/products');
const authRoutes       = require('./routes/auth');
const checkoutRoutes   = require('./routes/checkout');

const app = express();

app.use(cors());
app.use(express.json()); // Body parser — must be before all routes

// Mount product routes
app.use('/api/products', productRoutes);

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount checkout route
app.use('/api/checkout', checkoutRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
