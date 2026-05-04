# Activity Diagram — User Registration Flow

## Full Registration Activity (Frontend + Backend)

```
                        [START]
                           |
                           v
                  User opens Register form
                           |
                           v
                  User fills in:
                  • First Name
                  • Email
                  • Password
                           |
                           v
              +------------+------------+
              |  Frontend Validation    |
              |  (real-time, on input)  |
              +------------+------------+
                           |
              +------------+------------+
              | Password rules check:   |
              | • Length >= 8?          |
              | • Has uppercase?        |
              | • Has special char?     |
              +---+------+----------+--+
                  |      |          |
                  | FAIL |          | PASS
                  v      |          v
          Show red hint  |   Show green "Strong ✓"
                         |
                         v
               User clicks "Create Account"
                         |
                         v
              +----------+----------+
              | Frontend re-validate |
              | all rules before POST|
              +----------+----------+
                         |
              +----------+----------+
              |  Pass?              |
              +--+------+-----------+
                 |      |
              NO |      | YES
                 v      v
         Show error  POST /api/auth/register
                     { firstName, email, password }
                     (over HTTPS)
                         |
                         v
              +----------+----------+
              |  Backend: Check      |
              |  required fields     |
              +----------+----------+
                         |
              +----------+----------+
              |  All present?       |
              +--+------+-----------+
                 |      |
              NO |      | YES
                 v      v
           400 Bad   Backend password
           Request   re-validation
                         |
              +----------+----------+
              |  Password rules OK? |
              +--+------+-----------+
                 |      |
              NO |      | YES
                 v      v
           400 Bad   findUserByEmail()
           Request   in auth_user.json
                         |
              +----------+----------+
              |  Email exists?      |
              +--+------+-----------+
                 |      |
            YES  |      | NO
                 v      v
           409 Conflict  bcrypt.hash(password, 10)
                              |
                              v
                         createUser()
                         write to auth_user.json
                              |
                              v
                    201 Created { success: true }
                              |
                              v
                    Browser: Toast "Account created!"
                    Switch to Login tab
                              |
                              v
                           [END]
```

---

## Decision Points Summary

| Decision                   | YES path                        | NO path              |
|----------------------------|---------------------------------|----------------------|
| Frontend password valid?   | Enable submit, show green hint  | Show red hint, block |
| All fields present?        | Continue to password check      | 400 — missing fields |
| Backend password rules OK? | Continue to duplicate check     | 400 — weak password  |
| Email already registered?  | 409 — email taken               | Hash & store user    |
