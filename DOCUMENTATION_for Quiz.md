# Quiz Portal — Technical Documentation

This document describes the **current** architecture and behavior of the project.

---

## 1) Project Summary

Quiz Portal is a quiz application with:

- authentication (Google + email/password)
- quiz listing and timed attempts
- result review and history
- admin quiz creation and management

The app runs primarily on:

- **React frontend (Vite)**
- **Firebase Auth + Firestore**

There is also a **minimal optional Django backend** for local utility/service checks.

---

## 2) Runtime Architecture

```text
Frontend (React, Vite)
  ├─ Firebase Auth
  └─ Firestore

Optional Django backend
  ├─ GET /
  └─ GET /api/health
```

### Key point

Frontend features are Firebase-first. The Django backend is intentionally simple and does not power core quiz flows.

---

## 3) Frontend Overview

### Core directories

- `apps/frontend/src/pages` — route-level pages
- `apps/frontend/src/components` — reusable UI pieces
- `apps/frontend/src/context/AuthContext.tsx` — auth state management
- `apps/frontend/src/api/hooks.ts` — Firestore operations with React Query
- `apps/frontend/src/firebase.ts` — Firebase SDK initialization

### Route intent

- `/login`, `/signup` — public auth pages
- `/dashboard` — list available quizzes
- `/quiz/:id` — attempt quiz
- `/results/:attemptId` — attempt review
- `/history` — user attempt history
- `/admin/create-quiz`, `/admin/manage` — admin tools

---

## 4) Data Model (Firestore)

### Collections

1. `users/{uid}`
   - identity profile
   - role (`USER` / `ADMIN`)

2. `quizzes/{quizId}`
   - metadata (title, description, timeLimit, etc.)

3. `quizzes/{quizId}/questions/{questionId}`
   - question text
   - options
   - answer index + order

4. `attempts/{attemptId}`
   - quiz/user reference
   - submitted answers
   - score/total
   - review payload

---

## 5) Auth and Role Behavior

- Firebase Auth manages sign-in and session lifecycle.
- App role handling uses `VITE_ADMIN_EMAILS` to mark admin users.
- Route-level protection:
  - `ProtectedRoute` for authenticated pages
  - `AdminRoute` for admin-only screens

---

## 6) Quiz Flow

1. User opens dashboard.
2. Frontend fetches published quizzes from Firestore.
3. User starts a quiz.
4. Quiz page loads quiz + questions.
5. Timer runs in the client.
6. Submit saves attempt to Firestore and updates counters.
7. Results page reads attempt detail and renders review.

---

## 7) Security Model

Primary enforcement is via Firestore rules:

- authenticated read/write boundaries
- user ownership restrictions for personal data
- admin-only operations for quiz management

Firebase config values in frontend are not secrets by design; security depends on auth + rules.

---

## 8) Optional Django Backend (Simplified)

### Purpose

- keep a tiny backend service footprint
- allow quick backend health endpoint locally
- avoid unnecessary complexity

### Current backend endpoints

- `GET /` — basic service info
- `GET /api/health` — health check JSON

### Backend dependencies

- `apps/backend/requirements.txt` contains only Django

---

## 9) Local Runbook

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Minimal Django backend

```bash
cd apps/backend
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py migrate
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

---

## 10) Deployment Model

Production deployment is frontend-focused:

- frontend deploys to Vercel
- Firebase hosts auth/database/rules/indexes

See `DEPLOYMENT.md` for exact commands and post-deploy checks.

---

## 11) Maintenance Notes

- Keep docs synced with architecture whenever backend scope changes.
- Keep `.gitignore` strict for build/temp artifacts.
- Prefer small, clear commits per layer (frontend/backend/docs).
