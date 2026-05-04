# Contract Table — User Registration API

## Endpoint: POST /api/auth/register

| Component        | Request (The Order)                                                                 | Response (The Delivery)                                                                 |
|------------------|-------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Method**       | POST                                                                                | —                                                                                       |
| **Endpoint**     | `/api/auth/register`                                                                | —                                                                                       |
| **Headers**      | `Content-Type: application/json`                                                    | `Content-Type: application/json`                                                        |
| **Status Code**  | —                                                                                   | `201 Created` / `400 Bad Request` / `409 Conflict` / `500 Internal Server Error`        |
| **Body (Input)** | `{ "firstName": "Alice", "email": "alice@foodmart.com", "password": "Alice@1234" }` | —                                                                                       |
| **Body (Output)**| —                                                                                   | `{ "success": true, "message": "Registration successful.", "user": { "id": 11, "firstName": "Alice", "email": "alice@foodmart.com" } }` |

---

## Password Validation Rules

| Rule                        | Frontend Check | Backend Check | Error if Violated          |
|-----------------------------|:--------------:|:-------------:|----------------------------|
| At least 8 characters       | ✅             | ✅            | 400 Bad Request            |
| At least 1 uppercase letter | ✅             | ✅            | 400 Bad Request            |
| At least 1 special character (`!@#$%^&*`) | ✅ | ✅       | 400 Bad Request            |
| Email not already registered| ❌             | ✅            | 409 Conflict               |

---

## Error Responses

| Scenario                        | Status | Response Body                                                                                    |
|---------------------------------|--------|--------------------------------------------------------------------------------------------------|
| Missing fields                  | 400    | `{ "success": false, "message": "Name, email, and password are required." }`                    |
| Weak password                   | 400    | `{ "success": false, "message": "Password must be at least 8 characters, include one uppercase letter and one special character." }` |
| Email already registered        | 409    | `{ "success": false, "message": "Email already registered." }`                                  |
| Server error                    | 500    | `{ "success": false, "message": "Registration failed." }`                                       |

---

## Endpoint: POST /api/auth/login

| Component        | Request                                                              | Response                                                                                                           |
|------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **Method**       | POST                                                                 | —                                                                                                                  |
| **Endpoint**     | `/api/auth/login`                                                    | —                                                                                                                  |
| **Headers**      | `Content-Type: application/json`                                     | `Content-Type: application/json`                                                                                   |
| **Status Code**  | —                                                                    | `200 OK` / `400 Bad Request` / `401 Unauthorized` / `500 Internal Server Error`                                   |
| **Body (Input)** | `{ "email": "alice@foodmart.com", "password": "Alice@1234" }`        | —                                                                                                                  |
| **Body (Output)**| —                                                                    | `{ "success": true, "token": "eyJ...", "user": { "id": 1, "firstName": "Alice", "email": "alice@foodmart.com" } }`|

> **Security Note:** Login errors always return "Invalid email or password." — never reveal whether the email exists.
