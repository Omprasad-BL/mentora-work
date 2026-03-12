# Mentora Backend API — MongoDB Edition

A RESTful backend for the Mentora mentorship platform built with **Node.js + Express + MongoDB (Mongoose)**.

---

## Tech Stack

| Layer        | Technology                          |
|---|---|
| Runtime      | Node.js v18+                        |
| Framework    | Express.js                          |
| Database     | MongoDB + Mongoose ODM              |
| Auth         | JWT + bcrypt                        |
| Validation   | Zod                                 |
| LLM          | Anthropic Claude (claude-sonnet-4-20250514) |
| Rate Limiting| express-rate-limit                  |

---

## Prerequisites

- Node.js v18+
- MongoDB 6+ (local) **or** a MongoDB Atlas cluster
- An Anthropic API key (for `/llm/summarize`)

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/mentora-backend-mongo.git
cd mentora-backend-mongo
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local MongoDB
MONGODB_URI="mongodb://localhost:27017/mentora_db"

# MongoDB Atlas
# MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/mentora_db"

JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

ANTHROPIC_API_KEY="sk-ant-..."

PORT=3000
NODE_ENV="development"
```

### 3. Run the Server

MongoDB collections and indexes are created automatically by Mongoose on first run.

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## Environment Variables Reference

| Variable           | Required         | Description                        |
|---|---|---|
| `MONGODB_URI`      | ✅               | MongoDB connection string           |
| `JWT_SECRET`       | ✅               | Secret key for signing JWTs         |
| `JWT_EXPIRES_IN`   | ❌               | Token expiry (default: `7d`)        |
| `ANTHROPIC_API_KEY`| ✅ for `/llm/*`  | Anthropic API key                   |
| `PORT`             | ❌               | Server port (default: `3000`)       |
| `NODE_ENV`         | ❌               | `development` or `production`       |

---

## API Documentation

All protected endpoints require:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint       | Access  | Description                        |
|---|---|---|---|
| POST   | /auth/signup   | Public  | Register as PARENT or MENTOR       |
| POST   | /auth/login    | Public  | Login, receive JWT                 |
| GET    | /me            | 🔒 Any  | Get current user profile           |

### Students *(Parent only)*

| Method | Endpoint    | Description                          |
|---|---|---|
| POST   | /students   | Create a student under parent        |
| GET    | /students   | List parent's students with bookings |

### Lessons

| Method | Endpoint                  | Access       | Description              |
|---|---|---|---|
| POST   | /lessons                  | 🔒 Mentor    | Create a lesson          |
| GET    | /lessons                  | 🔒 Any       | Browse all lessons       |
| GET    | /lessons/:id              | 🔒 Any       | Get lesson + sessions    |
| GET    | /lessons/:id/sessions     | 🔒 Any       | List sessions for lesson |

### Bookings *(Parent only)*

| Method | Endpoint   | Description                          |
|---|---|---|
| POST   | /bookings  | Enroll student in a lesson           |
| GET    | /bookings  | List all parent's bookings           |

### Sessions

| Method | Endpoint             | Access      | Description                        |
|---|---|---|---|
| POST   | /sessions            | 🔒 Mentor   | Create a session for a lesson      |
| POST   | /sessions/:id/join   | 🔒 Parent   | Register student attendance ✦ Bonus|

### LLM Summarization

| Method | Endpoint          | Access  | Description         |
|---|---|---|---|
| POST   | /llm/summarize    | 🔒 Any  | Summarize text      |

**Rate limit:** 10 requests/minute per IP.

**Request:**
```json
{ "text": "Your text here (50–10,000 chars)..." }
```

**Response:**
```json
{ "summary": "• Point one.\n• Point two.\n...", "model": "claude-sonnet-4-..." }
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "MongoDB is a document-oriented NoSQL database that stores data in flexible JSON-like documents. It is designed for scalability and developer agility. Unlike relational databases, MongoDB does not require a predefined schema."}'
```

---

## MongoDB Schema Design

```
users
  _id, email (unique), passwordHash, name, role (PARENT|MENTOR), timestamps

students
  _id, name, age?, parentId → users, timestamps
  index: { parentId: 1 }

lessons
  _id, title, description, mentorId → users, timestamps
  index: { mentorId: 1 }

bookings
  _id, studentId → students, lessonId → lessons, timestamps
  index: { studentId: 1, lessonId: 1 } unique

sessions
  _id, lessonId → lessons, date, topic, summary?, timestamps
  index: { lessonId: 1 }

sessionattendances  [bonus]
  _id, sessionId → sessions, studentId → students, joinedAt, timestamps
  index: { sessionId: 1, studentId: 1 } unique
```

---

## Project Structure

```
src/
├── app.js
├── index.js
├── config/
│   └── db.js                  # Mongoose connection
├── models/
│   ├── user.model.js
│   ├── student.model.js
│   ├── lesson.model.js
│   ├── booking.model.js
│   ├── session.model.js
│   └── sessionAttendance.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── student.controller.js
│   ├── lesson.controller.js
│   ├── booking.controller.js
│   ├── session.controller.js
│   └── llm.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── validate.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── student.routes.js
│   ├── lesson.routes.js
│   ├── booking.routes.js
│   ├── session.routes.js
│   └── llm.routes.js
└── services/
    └── llm.service.js
```

---

## Key Differences from PostgreSQL Version

| Aspect | PostgreSQL (Prisma) | MongoDB (Mongoose) |
|---|---|---|
| Schema | Strict, migration-based | Flexible, schema-optional |
| Relations | Foreign keys + JOINs | ObjectId refs + populate() |
| Migrations | `prisma migrate dev` | None needed — auto-created |
| Duplicate prevention | `@@unique` constraint | `{ unique: true }` index |
| Aggregations | SQL GROUP BY | MongoDB Aggregation Pipeline |
| Error code for duplicates | `P2002` | `11000` |

---

## Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- `passwordHash` stripped from all JSON responses via `toJSON()`
- Ownership checks enforced on every write operation
- No hardcoded secrets — all via environment variables
- Rate limiting on LLM endpoint
