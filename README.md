# Leave API

A RESTful API for HR leave management built with Node.js, Express and SQLite.

---

## Setup & Run

```bash
npm install
cp .env.example .env
node src/db/seed.js
node src/app.js
```

Server runs on `http://localhost:3000`

---

## Credentials

| Name            | Email                    | Password    | Role     |
|-----------------|--------------------------|-------------|----------|
| Maria Petrova   | maria@craftberry.com     | password123 | manager  |
| Ivan Georgiev   | ivan@craftberry.com      | password123 | employee |
| Elena Todorova  | elena@craftberry.com     | password123 | employee |
| Georgi Dimitrov | georgi@craftberry.com    | password123 | employee |

---

## Assumptions & Business Rules

- Working week is **Monday to Friday**
- **Public holidays are not implemented** — would require a country-specific calendar
- Leave balance resets every **January 1st**
- **Sick and unpaid** leave do not consume annual balance
- Start date **cannot be in the past**
- Only **pending** requests can be cancelled
- **Only the requester** can cancel their own leave
- Manager **cannot approve or reject their own** leave request
- Business rules are **re-validated at approval time** — balance and overlap are checked again in case state changed since submission
- Passwords are **hashed with bcrypt**
- JWT tokens expire after **8 hours**
- Input validation is handled by a **dedicated validator middleware** layer, keeping business logic in the service layer clean

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /auth/login | Login → returns JWT token |


### Employee
| Method | URL | Description |
|--------|-----|-------------|
| GET | /users/me/balance | View leave balance for current year |
| GET | /users/me/leaves | List all my leave requests |
| POST | /users/me/leaves | Submit a new leave request |
| GET | /users/me/leaves/:id | Get a single leave request |
| DELETE | /users/me/leaves/:id | Cancel a pending leave request |

### Manager
| Method | URL | Description |
|--------|-----|-------------|
| GET | /users/manager/leaves | List all pending requests |
| PUT | /users/manager/leaves/:id/approve | Approve a request |
| PUT | /users/manager/leaves/:id/reject | Reject a request |

---

## API Examples

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@craftberry.com","password":"password123"}'
```

### View balance
```bash
curl http://localhost:3000/users/me/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit leave request
```bash
curl -X POST http://localhost:3000/users/me/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"start_date":"2026-08-03","end_date":"2026-08-07","leave_type":"annual","reason":"Summer holiday"}'
```

### List my leaves
```bash
curl http://localhost:3000/users/me/leaves \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cancel a leave request
```bash
curl -X DELETE http://localhost:3000/users/me/leaves/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List pending requests (manager)
```bash
curl http://localhost:3000/users/manager/leaves \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve a request (manager)
```bash
curl -X PUT http://localhost:3000/users/manager/leaves/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reject a request (manager)
```bash
curl -X PUT http://localhost:3000/users/manager/leaves/1/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"reason":"Team is understaffed"}'
```

---

## What I'd do next

- Public holidays per country
- Email notifications on approve/reject
- Pagination on list endpoints
- Audit log — track every status change with who made it and when
- Rate limiting on login endpoint to prevent brute force
- Docker setup for easy deployment
- Multi-year balance history
