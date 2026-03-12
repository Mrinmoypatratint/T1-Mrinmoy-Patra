# Deployment Guide

## Production URL

- **Frontend:** https://t1-mrinmoy-patra.vercel.app

---

## What gets deployed

### Required (production)

- `apps/frontend` to **Vercel**
- Firestore rules/indexes to **Firebase**

### Optional (local/dev only)

- `apps/backend` minimal Django service (`/` and `/api/health`)

---

## Prerequisites

- Node.js >= 18
- Vercel CLI: `npm i -g vercel`
- Firebase CLI: `npm i -g firebase-tools`
- Firebase project with:
  - Authentication enabled (Google + Email/Password)
  - Firestore enabled

---

## 1) Configure environment variables

Create `apps/frontend/.env` for local use:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ADMIN_EMAILS=admin@example.com
```

Set the same values in Vercel Project Settings → Environment Variables.

---

## 2) Deploy Firestore rules and indexes

```bash
cd apps/frontend
firebase login
firebase use --add
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 3) Deploy frontend to Vercel

```bash
cd apps/frontend
npm install
npm run build
vercel --prod --yes
```

---

## 4) Post-deploy checks

In Firebase Console:

1. Go to **Authentication → Settings → Authorized domains**
2. Add your Vercel domain, e.g.:
   - `t1-mrinmoy-patra.vercel.app`

Then verify:

- Login / Signup works
- Dashboard loads quizzes
- Quiz attempt + results + history works
- Admin create/manage pages work for admin emails

---

## Redeploy workflow

### Frontend code changes

```bash
cd apps/frontend
vercel --prod --yes
```

### Rule/index changes

```bash
cd apps/frontend
firebase deploy --only firestore
```

---

## Optional Django backend deployment (not required for app runtime)

If you want to run the minimal backend locally:

```bash
cd apps/backend
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py migrate
d:/Projects/Quiz/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

Endpoints:

- `GET /`
- `GET /api/health`

---

## Troubleshooting

| Issue | Fix |
|------|-----|
| Google login fails on production | Add Vercel domain in Firebase Auth authorized domains |
| Firestore permission denied | Redeploy Firestore rules |
| Route refresh gives 404 | Ensure SPA rewrite in `apps/frontend/vercel.json` |
| Env var changes not reflected | Redeploy Vercel after env update |
