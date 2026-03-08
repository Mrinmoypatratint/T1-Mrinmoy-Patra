# Quiz Portal

A production-grade, full-stack quiz platform built with **React**, **TypeScript**, **Django REST Framework**, and **PostgreSQL**. Users can log in with Google OAuth or email/password, take timed quizzes, see results with answer review, and track attempt history. Admins can create quizzes with multiple-choice questions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + TailwindCSS (Vite)           │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Login   │ │Dashboard │ │QuizAttempt│ │ Results  │  │  │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│  │       └──────┬─────┴──────┬─────┴──────┬─────┘        │  │
│  │              │  React Query + Axios     │              │  │
│  └──────────────┼─────────────────────────┼──────────────┘  │
└─────────────────┼─────────────────────────┼─────────────────┘
                  │  REST API (JWT Bearer)  │
┌─────────────────┼─────────────────────────┼─────────────────┐
│                 ▼   Django REST Framework  ▼                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Middleware: CORS │ Rate Limit │ JWT Auth             │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Views (auth, quiz, attempt) → Serializers → Models  │    │
│  │ ┌─────────┐   ┌──────────┐   ┌──────────────────┐  │    │
│  │ │  Auth   │   │  Quiz    │   │  Django ORM      │  │    │
│  │ │  Quiz   │   │  Attempt │   │  (PostgreSQL)    │  │    │
│  │ │  Attempt│   │  Scoring │   │                   │  │    │
│  │ └─────────┘   └──────────┘   └────────┬─────────┘  │    │
│  └───────────────────────────────────────┼─────────────┘    │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                  ┌────────────────────────┐│
                  │   PostgreSQL 16        ││
                  │   ┌──────┐ ┌────────┐ │▼
                  │   │Users │ │Quizzes │ │
                  │   │Quests│ │Attempts│ │
                  │   └──────┘ └────────┘ │
                  └────────────────────────┘
```

### Authentication Flow

```
User → "Sign in with Google" → Google OAuth Consent
 → Google returns ID Token → Frontend sends to POST /api/auth/google
 → Backend verifies with Google → Creates/finds user → Signs JWT
 → Frontend stores JWT → All subsequent API calls include Bearer token

User → Email/password sign up → POST /api/auth/signup
 → Backend validates → bcrypt hash → Create user → Signs JWT

User → Email/password login → POST /api/auth/login
 → Backend verifies bcrypt hash → Signs JWT
```

---

## Tech Stack

| Layer          | Technology                                             |
|----------------|-------------------------------------------------------|
| **Frontend**   | React 18, TypeScript, Vite, TailwindCSS, React Query  |
| **Backend**    | Python 3.12, Django 6, Django REST Framework           |
| **Database**   | PostgreSQL 16                                          |
| **ORM**        | Django ORM                                             |
| **Auth**       | Google OAuth 2.0 + Email/Password (bcrypt) + JWT      |
| **DevOps**     | Docker, Docker Compose, GitHub Actions CI              |

---

## Project Structure

```
quiz-portal/
├── apps/
│   ├── backend/                 # Django REST API
│   │   ├── config/              # Django settings, urls, wsgi/asgi
│   │   │   ├── settings.py      # DB, CORS, DRF, logging, security
│   │   │   ├── urls.py          # Root URL config
│   │   │   └── wsgi.py          # WSGI entry point
│   │   ├── quiz_api/            # Main application
│   │   │   ├── models.py        # User, Quiz, Question, Attempt
│   │   │   ├── views/           # Modular view handlers
│   │   │   │   ├── auth.py      # Google OAuth, signup, login, me
│   │   │   │   ├── quiz.py      # CRUD + admin quiz creation
│   │   │   │   ├── attempt.py   # Submit, results, detail
│   │   │   │   └── health.py    # Health check
│   │   │   ├── serializers.py   # Request validation (DRF)
│   │   │   ├── authentication.py# Custom JWT auth backend
│   │   │   ├── exceptions.py    # Unified error responses
│   │   │   ├── urls.py          # API routing
│   │   │   └── management/
│   │   │       └── commands/
│   │   │           └── seed.py  # Database seeder
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── manage.py
│   └── frontend/                # React SPA
│       ├── src/
│       │   ├── api/             # Axios client + React Query hooks
│       │   ├── components/      # Navbar, Timer, QuestionCard, routes
│       │   ├── context/         # AuthContext (JWT + user state)
│       │   ├── pages/           # Login, Signup, Dashboard, Quiz, Results, History, Admin
│       │   ├── types/           # Shared TypeScript interfaces
│       │   ├── App.tsx          # Routing
│       │   └── main.tsx         # Entry point
│       ├── Dockerfile
│       └── package.json
├── docker/
│   └── nginx.conf               # Reverse proxy config
├── .github/workflows/ci.yml     # CI pipeline
├── docker-compose.yml
└── .env.example
```

---

## Prerequisites

- **Python** >= 3.12
- **Node.js** >= 18
- **PostgreSQL** 16 (or use Docker)
- **Google Cloud Console** project with OAuth 2.0 credentials

---

## Getting Started

### 1. Clone & Configure

```bash
git clone <repo-url> quiz-portal
cd quiz-portal
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quiz_portal
JWT_SECRET=your-random-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
ADMIN_EMAILS=your-email@gmail.com
CORS_ORIGIN=http://localhost:5173
```

### 2. Backend Setup

```bash
cd apps/backend
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py seed          # seeds sample quizzes + users
```

### 3. Frontend Setup

```bash
cd apps/frontend
npm install
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (from apps/backend with venv activated)
python manage.py runserver 4000

# Terminal 2 — Frontend (from apps/frontend)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:5173` as an Authorized JavaScript Origin
4. Copy the Client ID into `.env` as `GOOGLE_CLIENT_ID`
5. Also create `apps/frontend/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 6. Seed Accounts

After running `python manage.py seed`, you can log in with:

| Email               | Password   | Role  |
|---------------------|------------|-------|
| admin@example.com   | admin123   | Admin |
| user@example.com    | user123    | User  |

---

## Docker Usage

```bash
# Start all services (Postgres + Backend + Frontend)
docker compose up --build

# Stop
docker compose down

# Reset database
docker compose down -v
docker compose up --build
```

Once running:

- **App**: http://localhost
- **API**: http://localhost/api/health

---

## API Endpoints

| Method | Endpoint                         | Auth     | Description              |
|--------|----------------------------------|----------|--------------------------|
| GET    | `/api/health`                    | Public   | Health check             |
| POST   | `/api/auth/google`               | Public   | Google OAuth login       |
| POST   | `/api/auth/signup`               | Public   | Email/password signup    |
| POST   | `/api/auth/login`                | Public   | Email/password login     |
| GET    | `/api/auth/me`                   | Bearer   | Current user profile     |
| GET    | `/api/quizzes`                   | Bearer   | List published quizzes   |
| GET    | `/api/quizzes/:id`               | Bearer   | Quiz detail (no answers) |
| POST   | `/api/quizzes`                   | Admin    | Create quiz              |
| POST   | `/api/attempt`                   | Bearer   | Submit quiz attempt      |
| GET    | `/api/attempt/results/:userId`   | Bearer   | User's attempt history   |
| GET    | `/api/attempt/detail/:attemptId` | Bearer   | Attempt detail + review  |

---

## Key Features

- **Dual authentication** — Google OAuth 2.0 and email/password (bcrypt) with JWT
- **Secure server-side scoring** — answers validated against the database, never exposed to client
- **Duplicate prevention** — unique constraint on `(quiz_id, user_id)`
- **Countdown timer** — auto-submits when time expires, with late-submission logging
- **Answer review** — see correct/incorrect answers after submission
- **Admin dashboard** — dynamic quiz builder with question management
- **Glassmorphism UI** — modern dark theme with smooth animations
- **Rate limiting** — global (100/hr) and auth-specific (20/hr) throttling
- **DRF serializer validation** — all request bodies validated before processing
- **Database indexes** — optimized queries for published quizzes, user lookups, attempt history

---

## Environment Variables

| Variable           | Required | Default                           | Description                            |
|--------------------|----------|-----------------------------------|----------------------------------------|
| `DATABASE_URL`     | Yes      | `postgresql://...localhost/quiz_portal` | PostgreSQL connection URL        |
| `JWT_SECRET`       | Yes      | —                                 | Secret key for JWT signing (HS256)     |
| `GOOGLE_CLIENT_ID` | Yes      | —                                 | Google OAuth 2.0 Client ID             |
| `ADMIN_EMAILS`     | No       | `admin@example.com`               | Comma-separated admin emails           |
| `PORT`             | No       | `4000`                            | Backend server port                    |
| `DJANGO_ENV`       | No       | `development`                     | `production` enables security headers  |
| `CORS_ORIGIN`      | No       | `http://localhost:5173`           | Allowed CORS origin                    |
| `ALLOWED_HOSTS`    | No       | `localhost,127.0.0.1`             | Django allowed hosts (comma-separated) |

Frontend (build-time):

| Variable                | Required | Description                        |
|-------------------------|----------|------------------------------------|
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth Client ID for frontend |

---

## Assumptions & Trade-offs

1. **Single attempt per quiz** — each user can only attempt a quiz once (enforced by DB constraint). This simplifies scoring but doesn't support retakes.
2. **JWT-only auth (no refresh tokens)** — tokens expire after 7 days. A refresh token flow would improve security for production.
3. **PostgreSQL ArrayField** — quiz options use `ArrayField`, tying the project to PostgreSQL. This simplifies the schema vs. a separate `Option` model.
4. **Client-side timer** — the timer runs in the browser. The backend logs late submissions (>5s grace) but still accepts them, prioritizing UX over strict enforcement.
5. **No pagination** — quiz listing and history endpoints return all records. For production scale, cursor-based pagination would be needed.
6. **Gunicorn workers** — Docker uses 3 sync workers. For high concurrency, consider uvicorn + ASGI.

---

## Deployment Guide

### Production Checklist

1. Set strong `JWT_SECRET` (32+ random characters)
2. Set `DJANGO_ENV=production` (enables security headers)
3. Set `ALLOWED_HOSTS` to your domain(s)
4. Configure `GOOGLE_CLIENT_ID` with production domain origins
5. Set `ADMIN_EMAILS` to actual admin email addresses
6. Use managed PostgreSQL (e.g., Supabase, Neon, RDS)
7. Update `CORS_ORIGIN` to your production frontend URL
8. Enable HTTPS with a reverse proxy (e.g., Cloudflare, nginx + certbot)

### Deploy with Docker

```bash
# Build and deploy
docker compose up -d --build

# View logs
docker compose logs -f backend

# Reset database
docker compose down -v
docker compose up -d --build
```

Once running:

- **App**: http://localhost
- **API**: http://localhost/api/health

---

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   quizzes    │     │  questions   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (UUID PK) │◄────│ created_by   │     │ quiz_id (FK) │──►│
│ email (uniq) │     │ id (UUID PK) │◄────│ id (UUID PK) │
│ name         │     │ title        │     │ question_text│
│ password     │     │ description  │     │ options[]    │
│ photo_url    │     │ time_limit   │     │ correct_idx  │
│ role         │     │ is_published │     │ order        │
│ created_at   │     │ created_at   │     │ created_at   │
│ updated_at   │     │ updated_at   │     └──────────────┘
└──────────────┘     └──────────────┘
       ▲                    ▲
       │                    │
       │  ┌──────────────┐  │
       └──│  attempts    │──┘
          ├──────────────┤
          │ id (UUID PK) │
          │ quiz_id (FK) │
          │ user_id (FK) │  ← UNIQUE(quiz_id, user_id)
          │ answers (JSON)│
          │ score         │
          │ total_score   │
          │ started_at    │
          │ submitted_at  │
          └──────────────┘
```

---

## License

MIT
