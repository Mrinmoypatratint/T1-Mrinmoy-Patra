# Deployment Guide

## Live URL

**Frontend:** https://quiz-portal-afa55.web.app

---

## Architecture Overview

| Component          | Platform              | Status     |
|--------------------|-----------------------|------------|
| Frontend (React)   | Firebase Hosting      | Deployed   |
| Backend (Functions)| Firebase Cloud Functions | Deployed |
| Database           | Cloud Firestore       | Deployed   |
| Authentication     | Firebase Auth         | Configured |

---

## Prerequisites

- **Node.js** >= 18
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Firebase Project** on **Blaze (pay-as-you-go)** plan (required for Cloud Functions)

---

## Step-by-Step Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/Mrinmoypatratint/T1-Mrinmoy-Patra.git
cd T1-Mrinmoy-Patra
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. **Upgrade to Blaze plan** (required for Cloud Functions)
4. Enable **Authentication** → Sign-in method → enable **Email/Password** and **Google**
5. Enable **Cloud Firestore** → Create database
6. Register a **Web App** → copy the config values

### 3. Configure Environment Variables

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

### 4. Firebase CLI Login & Project Selection

```bash
cd apps/frontend
firebase login
firebase use --add    # select your Firebase project
```

### 5. Install Dependencies

```bash
# Frontend
cd apps/frontend
npm install

# Cloud Functions
cd ../../functions
npm install
```

### 6. Build

```bash
# Build Cloud Functions
cd functions
npm run build

# Build Frontend (production)
cd ../apps/frontend
npm run build
```

### 7. Deploy Everything

```bash
cd apps/frontend

# Deploy Firestore rules + indexes
firebase deploy --only firestore

# Deploy Cloud Functions (requires Blaze plan)
firebase deploy --only functions

# Deploy Frontend to Firebase Hosting
firebase deploy --only hosting
```

Or deploy all at once:

```bash
firebase deploy
```

### 8. Verify Deployment

After deployment, Firebase CLI will output your hosting URL:
```
Hosting URL: https://<your-project-id>.web.app
```

Visit the URL and verify:
- Login/Signup works (Google + Email/Password)
- Dashboard loads published quizzes
- Quiz attempt + submission works (server-side scoring via Cloud Function)
- Results page shows score and answer review
- History page shows past attempts
- Admin can create and manage quizzes

---

## Environment Variables (Production)

All environment variables are baked into the frontend build at build time via Vite's `import.meta.env`. They are **not** exposed as server-side secrets — Firebase client SDK config values are designed to be public (security is enforced by Firestore rules and Cloud Functions).

| Variable                            | Description                    |
|-------------------------------------|--------------------------------|
| `VITE_FIREBASE_API_KEY`             | Firebase API key               |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth domain           |
| `VITE_FIREBASE_PROJECT_ID`         | Firebase project ID            |
| `VITE_FIREBASE_STORAGE_BUCKET`     | Firebase storage bucket        |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase messaging sender ID   |
| `VITE_FIREBASE_APP_ID`             | Firebase app ID                |
| `VITE_ADMIN_EMAILS`                | Comma-separated admin emails   |

---

## Redeployment

To redeploy after code changes:

```bash
cd apps/frontend
npm run build
firebase deploy --only hosting
```

To redeploy Cloud Functions after changes:

```bash
cd functions
npm run build
cd ../apps/frontend
firebase deploy --only functions
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `Error: Blaze plan required` | Upgrade Firebase project at console.firebase.google.com |
| `Functions deploy fails` | Ensure `functions/lib/` exists — run `npm run build` in `functions/` first |
| `Auth not working` | Verify Email/Password and Google sign-in are enabled in Firebase Console |
| `Firestore permission denied` | Ensure Firestore rules are deployed: `firebase deploy --only firestore` |
| `CORS / network errors` | Ensure Cloud Functions are deployed and the project ID in `.env` is correct |
