# Quiz Portal

A full-stack quiz platform built with **React**, **TypeScript**, **Firebase** (Auth + Firestore + Cloud Functions), and **TailwindCSS**. Users log in with Google or email/password, take timed quizzes, see results with answer review, and track attempt history. Admins (email-based role) can create quizzes with MCQs.

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
│  │              │React Query + Firebase SDK│              │  │
│  └──────────────┼─────────────────────────┼──────────────┘  │
└─────────────────┼─────────────────────────┼─────────────────┘
                  │                         │
     ┌────────────┼─────────────────────────┼────────────┐
     │            ▼     Firebase Platform    ▼            │
     │  ┌──────────────┐  ┌──────────────────────────┐   │
     │  │  Firebase     │  │  Cloud Firestore         │   │
     │  │  Auth         │  │  ┌──────┐ ┌──────────┐  │   │
     │  │  (Google +    │  │  │Users │ │ Quizzes  │  │   │
     │  │   Email/Pass) │  │  │      │ │ Questions│  │   │
     │  └──────────────┘  │  │      │ │ Attempts │  │   │
     │                     │  └──────┘ └──────────┘  │   │
     │  ┌──────────────┐  └──────────────────────────┘   │
     │  │  Cloud        │                                 │
     │  │  Functions    │  ← Server-side quiz scoring     │
     │  │  (Node.js)    │  ← Validates auth token         │
     │  └──────────────┘  ← Writes attempts securely      │
     └───────────────────────────────────────────────────┘
```

### Authentication Flow

```
User → "Sign in with Google" → Firebase Auth (Google Provider popup)
 → Firebase returns signed-in user → onAuthStateChanged listener fires
 → App creates/reads Firestore user doc → Session persisted automatically

User → Email/password signup → Firebase createUserWithEmailAndPassword
 → Firestore user doc created → Session active

User → Email/password login → Firebase signInWithEmailAndPassword
 → onAuthStateChanged fires → Existing Firestore user doc loaded
```

### Quiz Submission Flow (Server-Side Scoring)

```
User → Submits answers → Frontend calls Cloud Function (submitQuizAttempt)
 → Cloud Function validates Firebase Auth token
 → Reads questions + correct answers from Firestore (Admin SDK)
 → Calculates score server-side
 → Saves attempt document to Firestore
 → Increments quiz attemptCount
 → Returns result to frontend
```

---

## Tech Stack

| Layer              | Technology                                             |
|--------------------|-------------------------------------------------------|
| **Frontend**       | React 18, TypeScript, Vite, TailwindCSS, React Query  |
| **Auth**           | Firebase Authentication (Google + Email/Password)      |
| **Database**       | Cloud Firestore (NoSQL)                                |
| **Backend Logic**  | Firebase Cloud Functions (Node.js + TypeScript)        |
| **Scoring**        | Server-side via Cloud Function (not client-side)       |

---

## Project Structure

```
quiz-portal/
├── apps/
│   └── frontend/                # React SPA
│       ├── src/
│       │   ├── api/
│       │   │   └── hooks.ts     # React Query hooks (Firestore + Cloud Function calls)
│       │   ├── components/
│       │   │   ├── AdminRoute.tsx    # Admin role guard
│       │   │   ├── ProtectedRoute.tsx# Auth guard
│       │   │   ├── Navbar.tsx        # Navigation + user menu
│       │   │   ├── QuestionCard.tsx  # MCQ option selector
│       │   │   └── Timer.tsx         # Countdown timer with SVG ring
│       │   ├── context/
│       │   │   └── AuthContext.tsx    # Firebase Auth state + login/signup/logout
│       │   ├── lib/
│       │   │   └── firebase.ts       # Firebase init (auth, db, functions)
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx         # Email + Google login
│       │   │   ├── SignupPage.tsx         # Email signup + Google
│       │   │   ├── DashboardPage.tsx     # Published quiz listing
│       │   │   ├── QuizAttemptPage.tsx   # Quiz taking with timer + navigation
│       │   │   ├── ResultsPage.tsx       # Score + answer review
│       │   │   ├── HistoryPage.tsx       # Past attempt history
│       │   │   └── AdminCreateQuizPage.tsx # Admin quiz builder
│       │   ├── types/
│       │   │   └── index.ts          # Shared TypeScript interfaces
│       │   ├── App.tsx               # Routing
│       │   └── main.tsx              # Entry point
│       ├── firebase.json             # Firebase config (Firestore + Functions)
│       ├── firestore.rules           # Firestore security rules
│       ├── firestore.indexes.json    # Composite indexes
│       └── package.json
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts             # submitQuizAttempt (server-side scoring)
│   ├── package.json
│   └── tsconfig.json
├── .env.example
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Firebase Project** with Blaze (pay-as-you-go) plan (required for Cloud Functions)

---

## Getting Started

### 1. Clone & Configure

```bash
git clone <repo-url> quiz-portal
cd quiz-portal
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. **Upgrade to Blaze plan** (required for Cloud Functions)
4. Enable **Authentication** → Sign-in method → enable **Email/Password** and **Google**
5. Enable **Cloud Firestore** → Create database
6. Register a **Web App** → copy the config values

### 3. Environment Variables

Create `apps/frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_ADMIN_EMAILS=your-email@gmail.com
```

> `VITE_ADMIN_EMAILS` — comma-separated list of emails that get the Admin role on signup/login

### 4. Deploy Firestore Rules + Cloud Functions

```bash
cd apps/frontend
firebase login
firebase init              # select Firestore + Functions, accept defaults
firebase deploy --only firestore
firebase deploy --only functions
```

### 5. Install & Run Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open **http://localhost:5173** — sign in with the admin email to create quizzes.

---

## Firestore Data Model

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   users      │     │    quizzes       │     │   questions      │
│  /{uid}      │     │  /{auto-id}      │     │  (subcollection) │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ email        │     │ title            │     │ questionText     │
│ name         │◄────│ createdBy (uid)  │     │ options[]        │
│ photoUrl     │     │ creatorName      │     │ correctAnswerIndex│
│ role (USER/  │     │ description      │     │ order            │
│       ADMIN) │     │ timeLimit (sec)  │     └──────────────────┘
│ createdAt    │     │ isPublished      │
└──────────────┘     │ questionCount    │
       ▲             │ attemptCount     │
       │             │ createdAt        │
       │             └──────────────────┘
       │                    ▲
       │  ┌──────────────┐  │
       └──│  attempts    │──┘
          │  /{auto-id}  │
          ├──────────────┤
          │ quizId       │
          │ userId       │  ← 1 attempt per user per quiz
          │ answers{}    │
          │ score        │  ← Calculated server-side (Cloud Function)
          │ totalScore   │
          │ review[]     │  ← Denormalized answer review
          │ startedAt    │
          │ submittedAt  │
          └──────────────┘
```

---

## Security

### Firestore Rules

| Collection        | Read                          | Write                              |
|-------------------|-------------------------------|------------------------------------|
| `users/{uid}`     | Own document only             | Own document only                  |
| `quizzes`         | Any authenticated user        | Admin only (create/update)         |
| `questions`       | Any authenticated user        | Admin only (create)                |
| `attempts`        | Own attempts only             | **Cloud Function only** (Admin SDK)|

### Key Security Features

- **Server-side scoring** — Cloud Function reads correct answers, calculates score, and writes the attempt. Frontend never sends a self-calculated score.
- **Firebase Auth validation** — Cloud Function automatically validates the caller's auth token via `context.auth`.
- **Duplicate prevention** — Cloud Function checks for existing attempt before creating a new one.
- **Admin role enforcement** — `VITE_ADMIN_EMAILS` env var + Firestore user doc role field.
- **Route guards** — `ProtectedRoute` blocks unauthenticated access; `AdminRoute` blocks non-admins.
- **Attempt isolation** — Firestore rules ensure users can only read their own attempts.

---

## Key Features

- **Dual authentication** — Google OAuth and email/password via Firebase Auth
- **Server-side scoring** — quiz graded by Cloud Function, not the browser
- **Duplicate prevention** — one attempt per user per quiz (enforced server-side)
- **Countdown timer** — auto-submits when time expires, color-coded urgency
- **Answer review** — see correct/incorrect answers after submission
- **Admin quiz builder** — dynamic form to create quizzes with MCQs
- **Glassmorphism UI** — modern dark theme with smooth animations
- **Composited indexes** — optimized Firestore queries for published quizzes and user history

---

## Environment Variables

Frontend (`apps/frontend/.env`):

| Variable                            | Required | Description                          |
|-------------------------------------|----------|--------------------------------------|
| `VITE_FIREBASE_API_KEY`             | Yes      | Firebase API key                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase Auth domain                 |
| `VITE_FIREBASE_PROJECT_ID`         | Yes      | Firebase project ID                  |
| `VITE_FIREBASE_STORAGE_BUCKET`     | Yes      | Firebase storage bucket              |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Yes      | Firebase messaging sender ID         |
| `VITE_FIREBASE_APP_ID`             | Yes      | Firebase app ID                      |
| `VITE_ADMIN_EMAILS`                | No       | Comma-separated admin emails         |

---

## Assumptions & Trade-offs

1. **Single attempt per quiz** — each user can only attempt a quiz once (enforced by Cloud Function). Simplifies scoring but doesn't support retakes.
2. **Client-side timer** — the timer runs in the browser. The server records `startedAt` and `submittedAt` but doesn't strictly reject late submissions.
3. **Questions readable by users** — question text and options are fetched by the frontend for display. `correctAnswerIndex` is technically readable in question documents, but the score is calculated server-side so tampering yields no benefit.
4. **No pagination** — quiz listing and history return all records. For production scale, cursor-based pagination would be needed.
5. **Blaze plan required** — Firebase Cloud Functions require the pay-as-you-go plan (free tier includes 2M invocations/month).
