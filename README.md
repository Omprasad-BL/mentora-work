# 🎓 Mentora Backend API — MongoDB Edition

A RESTful backend for the **Mentora mentorship platform** connecting Parents, Students, and Mentors with JWT authentication, role-based access control, and AI-powered text summarization.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F7B93E?style=flat&logo=jsonwebtokens&logoColor=black)
![Anthropic](https://img.shields.io/badge/LLM-Anthropic_Claude-6B48FF?style=flat)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Server](#-running-the-server)
- [API Reference](#-api-reference)
- [Postman Testing Guide](#-postman-testing-guide)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## 🧭 Overview

Mentora is a mentorship platform with three user roles:

| Role | How Created | Permissions |
|---|---|---|
| **PARENT** | Self-registers via `/auth/signup` | Create students, book lessons, join sessions |
| **MENTOR** | Self-registers via `/auth/signup` | Create lessons, create sessions |
| **STUDENT** | Created by a Parent | Enrolled in lessons, attends sessions |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| LLM | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Rate Limiting | express-rate-limit |

---

## ✅ Prerequisites

Make sure the following are installed before proceeding:

- [Node.js v18+](https://nodejs.org)
- [MongoDB v6+](https://www.mongodb.com/try/download/community) — or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- [Git](https://git-scm.com)
- An [Anthropic API Key](https://console.anthropic.com) *(required for `/llm/summarize`)*

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mentora-backend-mongo.git
cd mentora-backend-mongo
```

### 2. Install dependencies

```bash
npm install
```

---

## ⚙️ Configuration

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# ── MongoDB ──────────────────────────────────────────────
# Option A: Local MongoDB
MONGODB_URI="mongodb://localhost:27017/mentora_db"

# Option B: MongoDB Atlas (free cloud)
# MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/mentora_db"

# ── JWT ──────────────────────────────────────────────────
JWT_SECRET="replace-this-with-a-long-random-string"
JWT_EXPIRES_IN="7d"

# ── Anthropic LLM ────────────────────────────────────────
ANTHROPIC_API_KEY="sk-ant-..."

# ── Server ───────────────────────────────────────────────
PORT=3000
NODE_ENV="development"
```

### Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | Token expiry duration. Default: `7d` |
| `ANTHROPIC_API_KEY` | ✅ for `/llm/*` | Get from [console.anthropic.com](https://console.anthropic.com) |
| `PORT` | ❌ | Server port. Default: `3000` |
| `NODE_ENV` | ❌ | `development` or `production` |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

### MongoDB Atlas Setup (Optional)

If you prefer a free cloud database instead of installing MongoDB locally:

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (free **M0** tier is fine)
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development)
5. Click **Connect → Connect your application** and copy the connection string
6. Replace `<user>` and `<password>` and paste it into `MONGODB_URI`

---

## 🚀 Running the Server

> MongoDB collections and indexes are created automatically by Mongoose on first startup — no migrations needed.

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

You should see:

```
✅ MongoDB connected: localhost
🚀 Mentora API running on port 3000
📦 Database: MongoDB
📖 Environment: development
```

### Verify it's running

```bash
GET http://localhost:3000/health
```

```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2026-03-12T10:00:00.000Z"
}
```

---

## 📡 API Reference

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register as `PARENT` or `MENTOR` |
| `POST` | `/auth/login` | Public | Login and receive JWT token |
| `GET` | `/me` | 🔒 Any | Get current user profile |

**Signup body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe",
  "role": "PARENT"
}
```

**Login body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

---

### 👶 Students *(Parent only)*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/students` | 🔒 Parent | Create a student under the parent account |
| `GET` | `/students` | 🔒 Parent | List all students with their bookings |

**Create student body:**
```json
{
  "name": "Rohan Mehta",
  "age": 12
}
```

---

### 📖 Lessons

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/lessons` | 🔒 Mentor | Create a new lesson |
| `GET` | `/lessons` | 🔒 Any | Browse all lessons |
| `GET` | `/lessons/:id` | 🔒 Any | Get lesson details and sessions |
| `GET` | `/lessons/:id/sessions` | 🔒 Any | List all sessions for a lesson |

**Create lesson body:**
```json
{
  "title": "Introduction to Algebra",
  "description": "Covers variables, expressions, and solving basic linear equations."
}
```

---

### 🔖 Bookings *(Parent only)*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/bookings` | 🔒 Parent | Enroll a student in a lesson |
| `GET` | `/bookings` | 🔒 Parent | List all bookings for parent's students |

**Create booking body:**
```json
{
  "studentId": "<student _id>",
  "lessonId": "<lesson _id>"
}
```

---

### 📅 Sessions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/sessions` | 🔒 Mentor | Create a session for one of your lessons |
| `POST` | `/sessions/:id/join` | 🔒 Parent | Register a student to attend a session ✦ |

**Create session body:**
```json
{
  "lessonId": "<lesson _id>",
  "date": "2026-04-01T10:00:00.000Z",
  "topic": "What is a Variable?",
  "summary": "Students practiced substitution."
}
```

**Join session body:**
```json
{
  "studentId": "<student _id>"
}
```

---

### 🤖 LLM Summarization

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/llm/summarize` | 🔒 Any | Summarize text using Claude AI |

> ⏱️ **Rate limited:** 10 requests per minute per IP

**Request:**
```json
{
  "text": "Your text here (minimum 50, maximum 10,000 characters)..."
}
```

**Response:**
```json
{
  "summary": "• Key point one.\n• Key point two.\n• Key point three.",
  "model": "claude-sonnet-4-20250514"
}
```

**Error codes:**

| Status | Reason |
|---|---|
| `400` | `text` missing, empty, or under 50 characters |
| `413` | Text exceeds 10,000 characters |
| `429` | Rate limit exceeded |
| `502` | Anthropic API call failed |

**Example curl:**
```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating them. Variables represent quantities without fixed values and are foundational for all advanced mathematics and sciences."
  }'
```

---

## 🧪 Postman Testing Guide

Follow these steps **in order**. Each step depends on the previous one.

> 💡 Create a Postman **Collection** and add **Collection Variables**: `MENTOR_TOKEN`, `PARENT_TOKEN`, `LESSON_ID`, `STUDENT_ID`, `SESSION_ID`. Use them as `{{VARIABLE_NAME}}` in your requests.

---

### Step 1 — Sign Up Mentor

```
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "email": "mentor@mentora.com",
  "password": "mentor1234",
  "name": "Dr. Arjun Sharma",
  "role": "MENTOR"
}
```

---

### Step 2 — Sign Up Parent

```
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "email": "parent@mentora.com",
  "password": "parent1234",
  "name": "Priya Mehta",
  "role": "PARENT"
}
```

---

### Step 3 — Login as Mentor → Save `MENTOR_TOKEN`

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{ "email": "mentor@mentora.com", "password": "mentor1234" }
```

---

### Step 4 — Login as Parent → Save `PARENT_TOKEN`

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{ "email": "parent@mentora.com", "password": "parent1234" }
```

---

### Step 5 — Create Lesson (Mentor) → Save `LESSON_ID`

```
POST http://localhost:3000/lessons
Authorization: Bearer {{MENTOR_TOKEN}}
Content-Type: application/json

{
  "title": "Introduction to Algebra",
  "description": "Covers variables, expressions, and solving basic linear equations."
}
```

---

### Step 6 — Create Student (Parent) → Save `STUDENT_ID`

```
POST http://localhost:3000/students
Authorization: Bearer {{PARENT_TOKEN}}
Content-Type: application/json

{ "name": "Rohan Mehta", "age": 12 }
```

---

### Step 7 — Book the Lesson (Parent)

```
POST http://localhost:3000/bookings
Authorization: Bearer {{PARENT_TOKEN}}
Content-Type: application/json

{
  "studentId": "{{STUDENT_ID}}",
  "lessonId": "{{LESSON_ID}}"
}
```

---

### Step 8 — Create Session (Mentor) → Save `SESSION_ID`

```
POST http://localhost:3000/sessions
Authorization: Bearer {{MENTOR_TOKEN}}
Content-Type: application/json

{
  "lessonId": "{{LESSON_ID}}",
  "date": "2026-04-01T10:00:00.000Z",
  "topic": "What is a Variable?",
  "summary": "Students practiced substitution."
}
```

---

### Step 9 — Join Session (Parent)

```
POST http://localhost:3000/sessions/{{SESSION_ID}}/join
Authorization: Bearer {{PARENT_TOKEN}}
Content-Type: application/json

{ "studentId": "{{STUDENT_ID}}" }
```

---

### Step 10 — Test LLM Summarize

```
POST http://localhost:3000/llm/summarize
Authorization: Bearer {{PARENT_TOKEN}}
Content-Type: application/json

{
  "text": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating them. Variables represent quantities without fixed values and are foundational for all advanced mathematics and sciences."
}
```

---

### ❌ Error Case Tests

**Duplicate booking → expect `409`**
```json
POST /bookings  (same studentId + lessonId again)
```

**Wrong role — Parent creates lesson → expect `403`**
```json
POST /lessons  with PARENT_TOKEN
```

**LLM text too short → expect `400`**
```json
{ "text": "Too short." }
```

**No token → expect `401`**
```
GET /students  (no Authorization header)
```

---

## 📁 Project Structure

```
mentora-backend-mongo/
├── src/
│   ├── index.js                     # Entry point — connects DB and starts server
│   ├── app.js                       # Express app, routes, error handlers
│   ├── config/
│   │   └── db.js                    # Mongoose connection
│   ├── models/
│   │   ├── user.model.js
│   │   ├── student.model.js
│   │   ├── lesson.model.js
│   │   ├── booking.model.js
│   │   ├── session.model.js
│   │   └── sessionAttendance.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── lesson.controller.js
│   │   ├── booking.controller.js
│   │   ├── session.controller.js
│   │   └── llm.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verify + requireRole()
│   │   └── validate.middleware.js   # Zod schemas + validation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── lesson.routes.js
│   │   ├── booking.routes.js
│   │   ├── session.routes.js
│   │   └── llm.routes.js
│   └── services/
│       └── llm.service.js           # Anthropic Claude API integration
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

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
  unique index: { studentId, lessonId }

sessions
  _id, lessonId → lessons, date, topic, summary?, timestamps
  index: { lessonId: 1 }

sessionattendances
  _id, sessionId → sessions, studentId → students, joinedAt, timestamps
  unique index: { sessionId, studentId }
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- `passwordHash` stripped from all JSON responses via Mongoose `toJSON()`
- **Ownership checks** on every write — parents can only manage their own students; mentors can only add sessions to their own lessons
- No hardcoded secrets — all keys read from **environment variables**
- LLM endpoint protected with **rate limiting** (10 req/min per IP)
- Duplicate bookings and session attendances prevented by **unique database indexes**

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `MongoDB connection refused` | Run `sudo systemctl start mongod` or start MongoDB manually |
| `JWT_SECRET error on startup` | Check `.env` exists and `JWT_SECRET` is set |
| `401 Unauthorized` | Token missing, expired, or malformed — re-login to get a fresh token |
| `403 Forbidden` | Your role doesn't have permission for this endpoint |
| `409 Conflict` on booking | Student is already booked for this lesson |
| `502 Bad Gateway` on `/llm/summarize` | `ANTHROPIC_API_KEY` is invalid or Anthropic API is down |
| Port `3000` already in use | Change `PORT` in `.env` or kill the process using that port |

---

## 📄 License

MIT
