# Contract Table — Checkout & Order History API

## Endpoint: POST /api/checkout

| Component        | Request (The Order)                                                                                      | Response (The Delivery)                                                                           |
|------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **Method**       | POST                                                                                                     | —                                                                                                 |
| **Endpoint**     | `/api/checkout`                                                                                          | —                                                                                                 |
| **Headers**      | `Content-Type: application/json` `Authorization: Bearer <token>`                                        | `Content-Type: application/json`                                                                  |
| **Status Code**  | —                                                                                                        | `201 Created` / `400 Bad Request` / `401 Unauthorized` / `500 Internal Server Error`              |
| **Body (Input)** | `{ "customerName": "Alice", "address": "123 Main St", "cardNumber": "1234567890123456", "cartItems": [{ "id": 1, "qty": 2 }] }` | —                                                          |
| **Body (Output)**| —                                                                                                        | `{ "success": true, "message": "Order placed successfully.", "orderId": 1, "total": 5.98 }`      |

> **Security Note:** Email is taken from the JWT token — not the request body. This prevents users from placing orders under another person's email.

---

## Endpoint: GET /api/orders

| Component       | Request                                         | Response                                                                                       |
|-----------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **Method**      | GET                                             | —                                                                                             |
| **Endpoint**    | `/api/orders`                                   | —                                                                                             |
| **Headers**     | `Authorization: Bearer <token>`                 | `Content-Type: application/json`                                                              |
| **Status Code** | —                                               | `200 OK` / `401 Unauthorized` / `500 Internal Server Error`                                   |
| **Body**        | *(Empty — GET has no body)*                     | `{ "success": true, "count": 2, "data": [ { "id": 1, "customerName": "Alice", "totalPrice": 5.98, "status": "confirmed", "items": [...] } ] }` |

---

## Endpoint: GET /api/orders/:id

| Component       | Request                                         | Response                                                                                       |
|-----------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **Method**      | GET                                             | —                                                                                             |
| **Endpoint**    | `/api/orders/1`                                 | —                                                                                             |
| **Headers**     | `Authorization: Bearer <token>`                 | `Content-Type: application/json`                                                              |
| **Status Code** | —                                               | `200 OK` / `401 Unauthorized` / `404 Not Found` / `500 Internal Server Error`                 |
| **Body**        | *(Empty)*                                       | `{ "success": true, "data": { "id": 1, "customerName": "Alice", "items": [...] } }`          |

---

## Validation Rules (POST /api/checkout)

| Field          | Required | Rule                          | Error if Violated             |
|----------------|:--------:|-------------------------------|-------------------------------|
| `customerName` | ✅       | Non-empty string              | 400 Bad Request               |
| `address`      | ✅       | Non-empty string              | 400 Bad Request               |
| `cardNumber`   | ✅       | Exactly 16 digits             | 400 Bad Request               |
| `cartItems`    | ✅       | Non-empty array               | 400 Bad Request               |
| JWT token      | ✅       | Valid, non-expired token      | 401 Unauthorized              |
| Product IDs    | ✅       | Must exist in database        | 500 (throws inside service)   |

---

## Error Responses

| Scenario                  | Status | Response Body                                                               |
|---------------------------|--------|-----------------------------------------------------------------------------|
| No token / invalid token  | 401    | `{ "success": false, "message": "Authentication required. Please log in." }`|
| Expired token             | 401    | `{ "success": false, "message": "Invalid or expired token." }`              |
| Cart is empty             | 400    | `{ "success": false, "message": "Cart is empty." }`                        |
| Missing fields            | 400    | `{ "success": false, "message": "All fields are required." }`              |
| Invalid card number       | 400    | `{ "success": false, "field": "cardNumber", "message": "Card number must be exactly 16 digits." }` |
| Product not found         | 500    | `{ "success": false, "message": "Product ID X not found." }`               |
| Order not found           | 404    | `{ "success": false, "message": "Order not found." }`                      |
