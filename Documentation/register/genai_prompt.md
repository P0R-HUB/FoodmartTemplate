# GenAI Prompts — User Registration & Authentication

## Prompt 1: Generate auth_user.json

**Used for:** Creating a test user database with bcrypt-hashed passwords

```
Generate a JSON file called "auth_user.json" for a food mart e-commerce application.
The file should contain a "users" array with 10 registered users.

Each user must have:
- id (number, sequential from 1)
- firstName (string)
- email (string, format: name@foodmart.com)
- password (string, bcrypt hash with salt rounds 10)
- registeredAt (string, date format YYYY-MM-DD)

Also include a "testCredentials" array listing the plain-text email and password
pairs for login testing purposes.

Password requirements for each test user:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 special character from: !@#$%^&*

Format as valid JSON.
```

---

## Prompt 2: Generate the Register Route (Backend)

**Used for:** Building the POST /api/auth/register Express route

```
Act as a Security Engineer. Write a Node.js/Express POST route for /api/auth/register
following the Controller-Route-Service pattern.

Requirements:
1. Route file: routes/auth.js
   - POST /api/auth/login → authController.login
   - POST /api/auth/register → authController.register

2. Controller: controllers/authController.js
   - register(req, res):
     • Validate that firstName, email, and password are all present (400 if missing)
     • Validate password server-side: min 8 chars, 1 uppercase, 1 special char (!@#$%^&*) (400 if fails)
     • Check for duplicate email using authService.findUserByEmail() (409 if exists)
     • Hash the password using bcrypt with saltRounds = 10
     • Store the new user via authService.createUser()
     • Return 201 with { success: true, message, user: { id, firstName, email } }
   - login(req, res):
     • Validate email and password present (400 if missing)
     • Find user by email — return 401 "Invalid email or password." if not found
     • Compare password with bcrypt.compare() — return 401 if no match
     • Sign a JWT with { userId, email } payload, secret key, expires in 24h
     • Return 200 with { success: true, token, user: { id, firstName, email } }

3. Service: services/authService.js
   - findUserByEmail(email): read auth_user.json, find by email (case-insensitive)
   - createUser({ firstName, email, hashedPassword }): append new user to auth_user.json

Data file: backend/data/auth_user.json
Structure: { "users": [ { "id", "firstName", "email", "password", "registeredAt" } ] }

Add comments to every function explaining the security logic.
```

---

## Prompt 3: Generate the Frontend Register Form + Validation

**Used for:** Building the Login/Register modal with real-time password strength feedback

```
Act as a Frontend Developer. I have a Bootstrap 5 e-commerce site (FoodMart).
I need to add a Login/Register modal triggered by the user icon in the navbar.

Requirements:
1. Modal with two tabs: "Login" and "Register"

2. Login tab form:
   - Email input
   - Password input
   - Submit button → POST http://localhost:3000/api/auth/login
   - On success: save token to localStorage, update navbar icon color, show toast
   - On error: show inline error message (never expose whether email exists)

3. Register tab form:
   - First Name input
   - Email input
   - Password input with REAL-TIME strength hint below it:
     • Check as user types: min 8 chars, 1 uppercase, 1 special char (!@#$%^&*)
     • Show red hint listing what is missing
     • Show green "Strong password ✓" when all rules pass
   - Submit button → POST http://localhost:3000/api/auth/register
   - On success: show toast "Account created!" and switch to Login tab

4. Frontend must validate password before sending to server (UX layer).
   Backend also validates (security layer) — both are required.

5. Use vanilla JavaScript (no jQuery) wrapped in an IIFE.
6. Store JWT token in localStorage with key "fm_token".
7. Store user object in localStorage with key "fm_user".
8. Add comments explaining each step.
```
