# Deployment Guide

## Live URL

**Frontend:** https://frontend-sepia-one-85.vercel.app

---

## Architecture Overview

| Component          | Platform              | Status     |
|--------------------|-----------------------|------------|
| Frontend (React)   | Vercel                | Deployed   |
| Database           | Cloud Firestore       | Deployed   |
| Authentication     | Firebase Auth         | Configured |
| Firestore Rules    | Firebase (Spark plan) | Deployed   |

> Quiz scoring is handled client-side in the React app. Firebase Cloud Functions are not required — the app runs entirely on the free Firebase Spark plan.

---

## Prerequisites

- **Node.js** >= 18
- **Vercel CLI** (`npm install -g vercel`)
- **Firebase CLI** (`npm install -g firebase-tools`) — for Firestore rules only
- **Firebase Project** on **Spark (free)** plan

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
3. Enable **Authentication** → Sign-in method → enable **Email/Password** and **Google**
4. Enable **Cloud Firestore** → Create database
5. Register a **Web App** → copy the config values
6. Go to **Authentication** → **Settings** → **Authorized domains** → add your Vercel domain

### 3. Configure Environment Variables

Create `apps/frontend/.env` (for local development):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ADMIN_EMAILS=admin@example.com
```

### 4. Deploy Firestore Rules

```bash
cd apps/frontend
firebase login
firebase use --add    # select your Firebase project
firebase deploy --only firestore
```

### 5. Install Dependencies & Build

```bash
cd apps/frontend
npm install
npm run build
```

### 6. Deploy to Vercel

```bash
cd apps/frontend
vercel login
vercel --prod --yes
```

### 7. Set Vercel Environment Variables

```bash
vercel env add VITE_FIREBASE_API_KEY production --value "your-api-key" --yes
vercel env add VITE_FIREBASE_AUTH_DOMAIN production --value "your-project.firebaseapp.com" --yes
vercel env add VITE_FIREBASE_PROJECT_ID production --value "your-project-id" --yes
vercel env add VITE_FIREBASE_STORAGE_BUCKET production --value "your-project.firebasestorage.app" --yes
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production --value "123456789" --yes
vercel env add VITE_FIREBASE_APP_ID production --value "1:123:web:abc" --yes
vercel env add VITE_ADMIN_EMAILS production --value "admin@example.com" --yes
```

Then redeploy to pick up the env vars:

```bash
vercel --prod --yes
```

### 8. Add Vercel Domain to Firebase Auth

1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add your Vercel production domain (e.g., `frontend-sepia-one-85.vercel.app`)

### 9. Verify Deployment

Visit your Vercel URL and verify:
- Login/Signup works (Google + Email/Password)
- Dashboard loads published quizzes
- Quiz attempt + submission works
- Results page shows score and answer review
- History page shows past attempts
- Admin can create and manage quizzes

---

## Environment Variables (Production)

All environment variables are set in the Vercel dashboard (or via CLI) and baked into the frontend build at build time via Vite's `import.meta.env`. Firebase client SDK config values are designed to be public — security is enforced by Firestore rules.

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
vercel --prod --yes
```

To update Firestore rules:

```bash
cd apps/frontend
firebase deploy --only firestore
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `Auth not working on Vercel` | Add Vercel domain to Firebase Auth → Settings → Authorized domains |
| `Google sign-in popup blocked` | Ensure the Vercel domain is authorized in Firebase Console |
| `Firestore permission denied` | Deploy Firestore rules: `firebase deploy --only firestore` |
| `Blank page on routes` | Ensure `vercel.json` has SPA rewrite rules |
| `Env vars not working` | Redeploy after adding env vars: `vercel --prod --yes` |
