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

## Assumptions

- Working week is Monday to Friday
- Public holidays are not implemented
- Leave balance resets every January 1st
- Sick and unpaid leave do not consume annual balance
- Start date cannot be in the past
- Only pending requests can be cancelled

---

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /auth/login | Login → returns JWT token |


### Employee 
### Manager


