# Quiz Portal

Quiz Portal is a web app where users can sign in, attempt timed quizzes, view detailed results, and track attempt history. Admin users can create and manage quizzes.

**Live app:** https://t1-mrinmoy-patra.vercel.app

**Repository:** https://github.com/Mrinmoypatratint/T1-Mrinmoy-Patra

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + React Query
- **Backend (production data/auth):** Firebase Auth + Cloud Firestore
- **Backend (optional local service):** Minimal Django (`/` + `/api/health`)
- **Hosting:** Vercel (frontend)

---

## Current Architecture

```text
Browser (React app)
  ├─ Firebase Auth (Google + Email/Password)
  └─ Cloud Firestore (users, quizzes, questions, attempts)

Optional local Django backend (apps/backend)
  ├─ GET /
  └─ GET /api/health
```

> Important: quiz data flow in the app is Firebase-first. The Django backend is intentionally minimal and optional.

---

## Application Flow (Mermaid)

```mermaid
flowchart TD
  A[User opens app] --> B{Authenticated?}
  B -- No --> C[Login / Signup]
  C --> D[Firebase Auth]
  D --> E[Create/read user doc]
  B -- Yes --> F[Dashboard]
  E --> F
  F --> G[Open Quiz]
  G --> H[Quiz Attempt + Timer]
  H --> I[Submit Attempt]
  I --> J[Firestore: attempts + counters]
  J --> K[Results]
  K --> L[History]
  F --> M{Admin?}
  M -- Yes --> N[Admin Create/Manage Quiz]
  M -- No --> G
```

---

## Project Structure

```text
Quiz/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── api/hooks.ts
│   │   │   ├── components/
│   │   │   ├── context/AuthContext.tsx
│   │   │   ├── pages/
│   │   │   ├── firebase.ts
│   │   │   ├── types.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── firestore.rules
│   │   ├── firestore.indexes.json
│   │   ├── vercel.json
│   │   └── package.json
│   └── backend/
│       ├── manage.py
│       ├── requirements.txt
│       └── quiz_project/
│           ├── settings.py
│           ├── urls.py
│           ├── views.py
│           ├── asgi.py
│           └── wsgi.py
├── DEPLOYMENT.md
├── DOCUMENTATION_for Quiz.md
├── screens/
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js >= 18
- Python >= 3.11 (project uses local venv at `d:/Projects/Quiz/.venv`)
- Firebase project with Auth + Firestore enabled

### 1) Frontend env

Create `apps/frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ADMIN_EMAILS=admin@example.com
```

### 2) Run frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173` or `:5174`).

### 3) Run optional Django backend

```bash
cd apps/backend
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py migrate
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

Health check:

- `http://localhost:8000/api/health`

---

## UI Screens Submission

All UI screens are included in the repository under:

- `screens/`

Files are clearly named by page/flow and include lightweight wireframe-style references.

---

## Firestore Data Model (high-level)

- `users/{uid}` → profile + role (`USER` / `ADMIN`)
- `quizzes/{quizId}` → metadata
- `quizzes/{quizId}/questions/{questionId}` → question docs
- `attempts/{attemptId}` → quiz submissions + score + review

---

## Security Notes

- Firebase config values in frontend are expected to be public.
- Real protection is enforced by **Firestore Security Rules**.
- Admin behavior is driven by `VITE_ADMIN_EMAILS` + user role checks.
- Firestore rules are version-controlled in `apps/frontend/firestore.rules` (not test mode).
- Firestore composite indexes are version-controlled in `apps/frontend/firestore.indexes.json`.

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for exact production steps.

---

## Assumptions / Trade-offs

- Primary runtime backend is Firebase (BaaS); Django backend is intentionally minimal and optional.
- Client-side quiz scoring is kept for simplicity/cost (Spark plan friendliness).
- UI screens in `/screens` are practical wireframe-style artifacts for evaluation traceability.

---

## Compliance Checklist (Evaluation-Oriented)

| Requirement | Status | Evidence |
|---|---|---|
| Public GitHub repo with history | ✅ | Repository link above |
| README with setup/env/overview/trade-offs | ✅ | This file |
| Deployment guide | ✅ | `DEPLOYMENT.md` |
| Technical documentation | ✅ | `DOCUMENTATION_for Quiz.md` |
| Flow chart (Mermaid) | ✅ | Embedded section above |
| `/screens` folder included | ✅ | `screens/` |
| BaaS backend used | ✅ | Firebase Auth + Firestore |
| Firestore security rules included | ✅ | `apps/frontend/firestore.rules` |
| Firestore indexes included | ✅ | `apps/frontend/firestore.indexes.json` |
| Production deployment available | ✅ | Live URL above |

> Note: `storage.rules` is not included because this project does not currently use Firebase Storage uploads.

---

## Status Snapshot

- Frontend: active and deployed on Vercel
- Firebase: primary runtime backend for app features
- Django backend: intentionally simplified for optional local use
