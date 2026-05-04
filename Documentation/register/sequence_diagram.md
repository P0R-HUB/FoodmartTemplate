# Sequence Diagram — User Registration

## Flow: POST /api/auth/register

```
User          Browser (Frontend)        Express Server         authController        authService          auth_user.json
 |                   |                        |                      |                     |                     |
 |--fill form------->|                        |                      |                     |                     |
 |  name, email,     |                        |                      |                     |                     |
 |  password         |                        |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |                   |--validate password--   |                      |                     |                     |
 |                   |  (frontend JS)         |                      |                     |                     |
 |                   |  • 8+ chars?           |                      |                     |                     |
 |                   |  • 1 uppercase?        |                      |                     |                     |
 |                   |  • 1 special char?     |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |<--show hint-----  |                        |                      |                     |                     |
 |  (real-time)      |                        |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |--click submit---->|                        |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |                   |--POST /api/auth/------>|                      |                     |                     |
 |                   |  register              |                      |                     |                     |
 |                   |  Content-Type:         |                      |                     |                     |
 |                   |  application/json      |                      |                     |                     |
 |                   |  { firstName, email,   |                      |                     |                     |
 |                   |    password }          |                      |                     |                     |
 |                   |  (over HTTPS)          |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |--route match-------->|                     |                     |
 |                   |                        |  POST /register      |                     |                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |--validate fields-   |                     |
 |                   |                        |                      |  (backend check)    |                     |
 |                   |                        |                      |  • required fields? |                     |
 |                   |                        |                      |  • password rules?  |                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |--findUserByEmail()->|                     |
 |                   |                        |                      |  (check duplicate)  |                     |
 |                   |                        |                      |                     |--readFile()-------->|
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |                     |<--users array-------|
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |                     |--find by email--    |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |<--null (not found)--|                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |--bcrypt.hash()--    |                     |
 |                   |                        |                      |  (hash password,    |                     |
 |                   |                        |                      |   saltRounds=10)    |                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |--createUser()------>|                     |
 |                   |                        |                      |  { firstName,       |                     |
 |                   |                        |                      |    email,           |                     |
 |                   |                        |                      |    hashedPassword } |                     |
 |                   |                        |                      |                     |--writeFile()------->|
 |                   |                        |                      |                     |  (append new user)  |
 |                   |                        |                      |                     |                     |
 |                   |                        |                      |<--newUser-----------|                     |
 |                   |                        |                      |                     |                     |
 |                   |                        |<--201 Created--------|                     |                     |
 |                   |                        |  { success: true,    |                     |                     |
 |                   |                        |    message, user }   |                     |                     |
 |                   |                        |                      |                     |                     |
 |                   |--show toast &          |                      |                     |                     |
 |                   |  switch to Login tab   |                      |                     |                     |
 |                   |                        |                      |                     |                     |
 |<--"Account        |                        |                      |                     |                     |
 |   created!"-------|                        |                      |                     |                     |
```

---

## Error Path: Duplicate Email

```
authController --findUserByEmail()--> authService --> auth_user.json
                                                           |
                                              <-- user found (not null)
                                                           |
authController <-- existing user exists
      |
      |--> return 409 Conflict
           { success: false, message: "Email already registered." }
```

---

## Mermaid Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Router as Express Router
    participant Controller as authController
    participant Service as authService
    participant File as auth_user.json

    User->>Browser: Fill name / email / password
    Browser->>Browser: Validate password (frontend JS)
    Browser-->>User: Real-time hint (strong/weak)
    User->>Browser: Click "Create Account"

    Browser->>Router: POST /api/auth/register (HTTPS)
    Router->>Controller: register(req, res)
    Controller->>Controller: Validate fields + password rules (backend)
    Controller->>Service: findUserByEmail(email)
    Service->>File: fs.readFileSync()
    File-->>Service: users array
    Service-->>Controller: null (email not taken)

    Controller->>Controller: bcrypt.hash(password, 10)
    Controller->>Service: createUser({ firstName, email, hashedPassword })
    Service->>File: fs.writeFileSync() (append new user)
    Service-->>Controller: newUser object

    Controller-->>Browser: 201 Created { success: true, user: {...} }
    Browser-->>User: Toast "Account created!" + switch to Login tab
```
