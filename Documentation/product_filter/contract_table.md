# Contract Table — Product Filter API

## Endpoint: GET /api/products

| Component       | Request (The Order)                                      | Response (The Delivery)                                                                 |
|-----------------|----------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Method**      | GET                                                      | —                                                                                       |
| **Endpoint**    | `/api/products`                                          | —                                                                                       |
| **Query Params**| `?category=Fruits & Vegetables`                          | —                                                                                       |
|                 | `?minPrice=1.00`                                         | —                                                                                       |
|                 | `?maxPrice=10.00`                                        | —                                                                                       |
|                 | `?sort=price_asc` \| `price_desc` \| `rating`            | —                                                                                       |
| **Headers**     | `Accept: application/json`                               | `Content-Type: application/json`                                                        |
| **Status Code** | —                                                        | `200 OK` / `500 Internal Server Error`                                                  |
| **Body**        | *(Empty — GET has no body)*                              | `{ "success": true, "count": 3, "data": [ { "id": 1, "name": "Fresh Avocado", "price": 2.99, "category": "Fruits & Vegetables", "rating": 4.8 }, ... ] }` |

---

## Endpoint: GET /api/products/:id

| Component       | Request                        | Response                                                                                 |
|-----------------|--------------------------------|------------------------------------------------------------------------------------------|
| **Method**      | GET                            | —                                                                                        |
| **Endpoint**    | `/api/products/1`              | —                                                                                        |
| **Headers**     | `Accept: application/json`     | `Content-Type: application/json`                                                         |
| **Status Code** | —                              | `200 OK` / `404 Not Found` / `500 Internal Server Error`                                 |
| **Body**        | *(Empty)*                      | `{ "success": true, "data": { "id": 1, "name": "Fresh Avocado", ... } }`                |

---

## Endpoint: GET /api/products/categories

| Component       | Request                        | Response                                                       |
|-----------------|--------------------------------|----------------------------------------------------------------|
| **Method**      | GET                            | —                                                              |
| **Endpoint**    | `/api/products/categories`     | —                                                              |
| **Headers**     | `Accept: application/json`     | `Content-Type: application/json`                               |
| **Status Code** | —                              | `200 OK` / `500 Internal Server Error`                         |
| **Body**        | *(Empty)*                      | `{ "success": true, "data": ["Fruits & Vegetables", "Dairy", "Snacks", ...] }` |

---

## Query Parameter Rules

| Parameter  | Type   | Required | Example              | Description                          |
|------------|--------|----------|----------------------|--------------------------------------|
| `category` | string | No       | `Fruits & Vegetables`| Filter products by category name     |
| `minPrice` | number | No       | `1.00`               | Show products with price ≥ minPrice  |
| `maxPrice` | number | No       | `10.00`              | Show products with price ≤ maxPrice  |
| `sort`     | string | No       | `price_asc`          | Sort: `price_asc`, `price_desc`, `rating` |
