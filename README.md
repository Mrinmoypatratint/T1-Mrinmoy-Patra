# Quiz Portal

A quiz platform built with **React 18**, **TypeScript**, **Firebase** (Auth + Firestore), and **TailwindCSS**. Users log in with Google or email/password, take timed quizzes, see results with answer review, and track attempt history. Admins (email-based role) can create and manage quizzes with MCQs.

**Live:** https://frontend-sepia-one-85.vercel.app

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
     └─────────────────────┴──────────────────────────────┘
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

### Quiz Submission Flow (Client-Side Scoring)

```
User → Submits answers → Frontend reads questions with correctAnswerIndex
 → Calculates score client-side
 → Saves attempt document to Firestore (with score + review data)
 → Increments quiz attemptCount
 → Redirects to results page
```

---

## Tech Stack

| Layer              | Technology                                             |
|--------------------|-------------------------------------------------------|
| **Frontend**       | React 18, TypeScript, Vite, TailwindCSS, React Query  |
| **Auth**           | Firebase Authentication (Google + Email/Password)      |
| **Database**       | Cloud Firestore (NoSQL, Spark free plan)               |
| **Hosting**        | Vercel (free tier)                                     |
| **Scoring**        | Client-side in React (via Firestore reads)             |

---

## Project Structure

```
Quiz/
├── apps/
│   ├── frontend/                     # React SPA (deployed to Vercel)
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   └── hooks.ts         # React Query + Firestore hooks
│   │   │   ├── components/
│   │   │   │   ├── AdminRoute.tsx    # Admin role guard
│   │   │   │   ├── ProtectedRoute.tsx# Auth guard
│   │   │   │   ├── Navbar.tsx        # Navigation + user menu
│   │   │   │   ├── QuestionCard.tsx  # MCQ option selector
│   │   │   │   └── Timer.tsx         # Countdown timer with SVG ring
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx   # Firebase Auth state + login/signup/logout
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── QuizAttemptPage.tsx
│   │   │   │   ├── ResultsPage.tsx
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   ├── AdminCreateQuizPage.tsx
│   │   │   │   └── AdminManageQuizzesPage.tsx
│   │   │   ├── firebase.ts          # Firebase SDK init (auth + db)
│   │   │   ├── types.ts             # Shared TypeScript interfaces
│   │   │   ├── App.tsx              # Route definitions
│   │   │   └── main.tsx             # Entry point
│   │   ├── firestore.rules          # Firestore security rules
│   │   ├── firestore.indexes.json   # Composite indexes
│   │   ├── vercel.json              # SPA rewrite rules
│   │   └── package.json
│   │
│   └── backend/                      # Django REST API (optional, for local dev)
│       ├── quiz_project/             # Django project settings
│       │   ├── settings.py
│       │   ├── urls.py
│       │   ├── wsgi.py
│       │   └── asgi.py
│       ├── quizzes/                  # Django app (models, views, serializers)
│       │   ├── models.py
│       │   ├── views/
│       │   ├── serializers.py
│       │   ├── authentication.py
│       │   ├── urls.py
│       │   └── migrations/
│       ├── manage.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── DEPLOYMENT.md
├── README.md
└── .env.example
```

---

## Prerequisites

- **Node.js** >= 18
- **Firebase Project** on **Spark (free)** plan
- **Firebase CLI** (`npm install -g firebase-tools`) — for Firestore rules only
- **Vercel CLI** (`npm install -g vercel`) — for deployment

---

## Getting Started

### 1. Clone & Configure

```bash
git clone https://github.com/Mrinmoypatratint/T1-Mrinmoy-Patra.git
cd T1-Mrinmoy-Patra
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → enable **Email/Password** and **Google**
4. Enable **Cloud Firestore** → Create database
5. Register a **Web App** → copy the config values

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

### 4. Deploy Firestore Rules

```bash
cd apps/frontend
firebase login
firebase init              # select Firestore, accept defaults
firebase deploy --only firestore
```

### 5. Install & Run Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open **http://localhost:5173** — sign in with the admin email to create quizzes.

### 6. Deploy to Vercel

```bash
cd apps/frontend
vercel --prod
```

Set the environment variables in Vercel dashboard (same as `.env` above). See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

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
          │ score        │  ← Calculated client-side
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
| `attempts`        | Own attempts only             | Own attempts only (authenticated)  |

### Key Security Features

- **Firestore security rules** — enforce per-user access on all collections. Users can only read/write their own documents.
- **Admin role enforcement** — `VITE_ADMIN_EMAILS` env var + Firestore user doc role field.
- **Route guards** — `ProtectedRoute` blocks unauthenticated access; `AdminRoute` blocks non-admins.
- **Attempt isolation** — Firestore rules ensure users can only read their own attempts.
- **Duplicate prevention** — client checks for existing attempt before allowing a new one.

---

## Key Features

- **Dual authentication** — Google OAuth and email/password via Firebase Auth
- **Client-side scoring** — quiz graded locally by reading correct answers from Firestore
- **Duplicate prevention** — one attempt per user per quiz
- **Countdown timer** — auto-submits when time expires, color-coded urgency
- **Answer review** — see correct/incorrect answers after submission
- **Admin quiz builder** — dynamic form to create quizzes with MCQs
- **Quiz management** — admins can publish/unpublish and delete quizzes
- **Glassmorphism UI** — modern dark theme with smooth animations
- **Composite indexes** — optimized Firestore queries for published quizzes and user history

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

1. **Single attempt per quiz** — each user can only attempt a quiz once. Simplifies scoring but doesn't support retakes.
2. **Client-side timer** — the timer runs in the browser. `startedAt` and `submittedAt` are recorded but late submissions aren't strictly rejected.
3. **Client-side scoring** — the frontend reads `correctAnswerIndex` from question documents, calculates the score, and writes the attempt. This simplifies architecture (no Cloud Functions / Blaze plan needed) but means the scoring logic runs in the browser.
4. **No pagination** — quiz listing and history return all records. For production scale, cursor-based pagination would be needed.
5. **Spark (free) plan** — the entire app runs on Firebase's free tier. No Cloud Functions or Blaze plan required.
