# GenAI Prompts — Checkout & Order History

## Prompt 1: Generate JWT Middleware

**Used for:** Creating the authentication middleware that protects checkout and order routes

```
Act as a Security Engineer. Write a Node.js Express middleware function called requireAuth
for a food mart e-commerce backend.

Requirements:
1. File: middleware/auth.js

2. The middleware must:
   - Read the Authorization header from the request
   - Expect format: "Bearer <token>"
   - Return 401 if the header is missing or not in Bearer format
   - Verify the token using jwt.verify() with the secret key
   - Attach the decoded payload to req.user (contains { userId, email })
   - Call next() if valid
   - Return 401 if the token is invalid or expired

3. Use JWT_SECRET from process.env.JWT_SECRET with fallback to 'foodmart-secret-key'

4. Add comments explaining each security step.
```

---

## Prompt 2: Generate Order History Route & Controller

**Used for:** Building GET /api/orders to let users view their past orders

```
Act as a Backend Architect. Using Node.js and Express, add an order history feature
to a food mart e-commerce backend following the Controller-Route-Service pattern.

Write the following files:

1. routes/orders.js
   - GET /api/orders  → requires JWT auth → orderController.getOrders
   - GET /api/orders/:id  → requires JWT auth → orderController.getOrderById

2. controllers/orderController.js
   - getOrders(req, res):
     • Use req.user.email from the JWT middleware
     • Call orderService.getOrdersByEmail(email)
     • Return { success: true, count: N, data: [...] }
   - getOrderById(req, res):
     • Use req.params.id and req.user.email
     • Return 404 if not found or does not belong to this user
     • Return { success: true, data: {...} }

3. services/orderService.js
   - getOrdersByEmail(email): query SQLite orders table WHERE email = ?
     then for each order, fetch its items from order_items table
     return orders sorted by createdAt DESC
   - getOrderById(id, email): query one order WHERE id = ? AND email = ?
     must verify email ownership (users can only see their own orders)

Database schema:
  orders: id, customerName, email, address, totalPrice, status, createdAt
  order_items: id, orderId, productId, productName, qty, price

Add comments explaining ownership checks and why email comes from JWT not the request body.
```

---

## Prompt 3: Protect Checkout with JWT and Update Frontend

**Used for:** Adding auth guard to the checkout flow (frontend + backend)

```
Act as a Full-Stack Developer. Update an existing checkout feature in a food mart
e-commerce app to require user authentication.

Backend changes:
1. routes/checkout.js — add requireAuth middleware before the checkout handler
2. controllers/checkoutController.js — get email from req.user.email (JWT payload)
   instead of req.body.email — never trust the client for sensitive identity data

Frontend changes (js/cart.js):
1. In openCheckoutModal():
   - Check localStorage for 'fm_token' and 'fm_user' before opening the modal
   - If not found: show a toast "Please log in before checking out." and open the
     authModal instead
   - If found: pre-fill the customer name field from the stored user object

2. In submitCheckout() fetch call:
   - Add Authorization: 'Bearer ' + token header using the token from localStorage
   - Remove email from the request body (server uses JWT email now)

Add comments explaining why email is taken from the token (prevents order spoofing).
```
