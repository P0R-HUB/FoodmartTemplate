const checkoutService = require('../services/checkoutService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_REGEX  = /^\d{16}$/;

// POST /api/checkout
async function checkout(req, res) {
  try {
    const { customerName, email, address, cardNumber, cartItems } = req.body;

    // ── Step 1: Validate cart is not empty ───────────────────────────────────
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // ── Step 2: Validate required fields ────────────────────────────────────
    if (!customerName || !email || !address || !cardNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // ── Step 3: Validate email (RegEx gatekeeper) ────────────────────────────
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, field: 'email', message: 'Invalid email format.' });
    }

    // ── Step 4: Validate card number (16 digits) ─────────────────────────────
    const cleanCard = String(cardNumber).replace(/\s/g, '');
    if (!CARD_REGEX.test(cleanCard)) {
      return res.status(400).json({ success: false, field: 'cardNumber', message: 'Card number must be exactly 16 digits.' });
    }

    // ── Step 5: Create order (server recalculates price + saves) ────────────
    const order = checkoutService.createOrder({ customerName, email, address, cartItems });

    // ── Step 6: Respond with success (frontend will clear cart) ─────────────
    res.status(201).json({
      success:  true,
      message:  'Order placed successfully.',
      orderId:  order.orderId,
      total:    order.totalPrice,
    });

  } catch (err) {
    // If save fails — do NOT clear the cart (transactional mindset)
    res.status(500).json({ success: false, message: err.message || 'Checkout failed. Please try again.' });
  }
}

module.exports = { checkout };
