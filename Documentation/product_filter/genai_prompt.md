# GenAI Prompts — Product Filter API

## Prompt 1: Generate the Backend Route & Controller

**Used for:** Generating the Express.js route with category query parameter support

```
Act as a Backend Architect. Using Node.js and Express, create a modular folder structure
following the Controller-Route-Service pattern.

Write the following files for a Food Mart e-commerce backend:

1. routes/products.js
   - GET /api/products  → accepts optional query params: category, minPrice, maxPrice, sort
   - GET /api/products/categories  → returns a list of unique categories
   - GET /api/products/:id  → returns one product by ID

2. controllers/productController.js
   - Handle request/response for each route above
   - Extract query parameters and pass to service layer
   - Return { success: true, count: N, data: [...] } on success
   - Return { success: false, message: "..." } with 404 or 500 on error

3. services/productService.js
   - Read product data from a local JSON file (data/products.json)
   - getAllProducts({ category, minPrice, maxPrice, sort }) — filter and sort the data
   - getProductById(id) — find a single product
   - getCategories() — return an array of unique category names

The data structure in products.json is:
{
  "products": [
    { "id": 1, "name": "Fresh Avocado", "price": 2.99, "category": "Fruits & Vegetables", "rating": 4.8 },
    ...
  ]
}

Ensure:
- Category filtering is case-insensitive
- sort supports: price_asc, price_desc, rating
- Code follows the Controller-Route-Service pattern
- Each file has comments explaining the logic
```

---

## Prompt 2: Generate the products.json Data File

**Used for:** Creating realistic food product test data

```
Generate a JSON file for a food mart e-commerce store called "products.json".
The file should have a "products" array with 15 products.

Each product must have:
- id (number, sequential starting from 1)
- name (string, realistic food product name)
- price (number, realistic price in USD)
- image (string, path like "images/thumb-{product}.png")
- category (string, one of: "Fruits & Vegetables", "Dairy & Eggs", "Meat & Seafood", "Snacks & Beverages", "Bakery")
- description (string, 1 sentence)
- rating (number, between 4.0 and 5.0)

Include at least 3 products per category.
Format as valid JSON.
```

---

## Prompt 3: Connect Frontend to Backend API

**Used for:** Updating the frontend JS to fetch from the API instead of a local JSON file

```
Act as a Full-Stack Developer. I have an existing frontend (HTML/CSS/JS) food mart website
that currently loads products from a local JSON file using fetch('./JSON/products.json').

I need to update the frontend JavaScript to:
1. Fetch products from a REST API at http://localhost:3000/api/products instead
2. When a user clicks a category button, send: GET /api/products?category={categoryName}
3. Handle the API response format: { success: true, count: N, data: [...] }
4. Show a loading state while fetching
5. Show an error message if the fetch fails (network error or non-200 status)

The product card HTML structure is:
<div class="product-item">
  <img src="{image}" alt="{name}">
  <h4>{name}</h4>
  <span class="price">${price}</span>
  <button class="add-to-cart">Add to Cart</button>
</div>

Keep the existing cart.js logic intact — do not modify it.
Add comments explaining each step of the fetch logic.
```
