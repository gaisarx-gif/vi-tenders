# SETUP.md — Step-by-step first-time setup for Vision-OS

This file walks you through every manual step to get Vision-OS running on your machine.
**All services and tools are free.** No credit card needed for any step.

> **Total time**: ~10 minutes if Node is already installed.

---

## Prerequisites (one-time)

You already have these installed:

- ✅ Node.js v24.15.0
- ✅ npm 11.12.1
- ✅ Git 2.54.0

You also need a **Google account** (any Gmail) to access:

- https://aistudio.google.com — to get a free Gemini API key
- https://console.firebase.google.com — to manage your existing Firebase project

---

## Step 1 — Get a free Gemini API key

This key lets the server call Google Gemini to extract tenders from PDFs.

**Free tier**: 15 requests/min, 1 500 req/day, 1 M tokens/day. No card required.

1. Open **https://aistudio.google.com/apikey** in your browser.
2. Sign in with your Google account (the same one you use for the Firebase project, ideally).
3. Click the blue button **"Create API key"**.
   - If a dialog asks "in which Google Cloud project?", pick **`gen-lang-client-0455111868`** (this is the project this app is already linked to). If it isn't in the list, just click **"Create API key in new project"**.
4. The page will display your key. It looks like `AIzaSyA-1234...` (≈ 39 characters).
5. Click the **copy** icon next to the key.
6. Open the file **`.env.local`** in this project (root folder).
7. Find the line:
   ```env
   GEMINI_API_KEY=TODO_PASTE_GEMINI_API_KEY_HERE
   ```
8. Replace `TODO_PASTE_GEMINI_API_KEY_HERE` with the key you just copied. **Don't add quotes.**
   It should look like:
   ```env
   GEMINI_API_KEY=AIzaSyA-your-real-key-here
   ```
9. Save the file.

> 🛡 **Keep this key private.** `.env.local` is already gitignored — it will not be pushed to GitHub.

---

## Step 2 — Generate a JWT secret

This secret signs the login cookies. **It must be a long random string.**

You're on Windows. Use **Git Bash** (it's installed with Git, search for "Git Bash" in the Start menu).

In Git Bash, run:

```bash
openssl rand -base64 48
```

You'll get something like:

```
M3NjxR8aQ7LsYpUq2vGHBkW1zM9YrTfX5DjEkPnBoVcAhSdCwQrLmKoIuYtPe8R
```

1. Copy that whole string.
2. Open `.env.local` again.
3. Find the line:
   ```env
   JWT_SECRET=TODO_PASTE_RANDOM_BASE64_SECRET_HERE
   ```
4. Replace `TODO_PASTE_RANDOM_BASE64_SECRET_HERE` with what you copied.
5. Save the file.

**Alternative** (if `openssl` isn't available): in any terminal,

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

> ⚠ Use a **different** secret in production than in development.

---

## Step 3 — (Optional) verify your Firebase web config

The values are already pre-filled in `.env.local` from the previously-committed config file. They're correct **as long as you keep using the existing Firebase project** (`gen-lang-client-0455111868`).

If you want to double-check, or if you ever switch Firebase projects:

1. Open **https://console.firebase.google.com**.
2. Click your project (`gen-lang-client-0455111868` or whatever you named it).
3. In the top-left, click the **⚙ gear icon** → **"Project settings"**.
4. Scroll down to **"Your apps"** section.
5. Find the **Web app** (icon: `</>`). Click it.
6. Under **"SDK setup and configuration"**, select **"Config"**.
7. You'll see something like:
   ```js
   const firebaseConfig = {
     apiKey: 'AIzaSy...',
     authDomain: '....firebaseapp.com',
     projectId: '...',
     storageBucket: '....firebasestorage.app',
     messagingSenderId: '...',
     appId: '1:...:web:...',
     measurementId: '...',
   };
   ```
8. Copy the values into `.env.local` matching:
   - `apiKey` → `VITE_FIREBASE_API_KEY` (also set in **server-side** `FIREBASE_AUTH_DOMAIN` if it differs)
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN` and `FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID` and `FIREBASE_PROJECT_ID`
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`
   - `measurementId` → `VITE_FIREBASE_MEASUREMENT_ID` (can be empty)

> ℹ The Firebase **web** API key is **safe to expose** — it identifies the project, not authorizes access. Real protection is in `firestore.rules` (and future App Check). See: https://firebase.google.com/docs/projects/api-keys

---

## Step 4 — Verify the Firestore "database ID"

This app uses a **named** Firestore database (not the default one). The pre-filled value is:

```env
VITE_FIREBASE_DATABASE_ID=ai-studio-8f0bb76a-1dd5-4bc2-8b03-ebcbc19d198e
FIREBASE_DATABASE_ID=ai-studio-8f0bb76a-1dd5-4bc2-8b03-ebcbc19d198e
```

To confirm:

1. Open https://console.firebase.google.com → your project → **Firestore Database** (left sidebar).
2. At the top, you'll see the database name. It should be `ai-studio-8f0bb76a-1dd5-4bc2-8b03-ebcbc19d198e` (or `(default)` for new projects).
3. If it's different, copy the actual name into both `VITE_FIREBASE_DATABASE_ID` and `FIREBASE_DATABASE_ID` in `.env.local`.

---

## Step 5 — Confirm OWNER_EMAIL

Pre-filled:

```env
OWNER_EMAIL=aawad39506@gmail.com
```

This account always has admin role. Change it to your actual super-admin Google address before deploying.

---

## Step 6 — Install dependencies (already running or done)

The agent has already started (or completed) `npm install` for you.

If you ever need to reinstall:

```bash
npm install
```

This downloads everything to `node_modules/`. ~150 MB on first run.

---

## Step 7 — First run

```bash
npm run dev
```

You should see:

```
info: Starting server initialization...
info: Firestore Admin SDK initialized {"databaseId":"ai-studio-8f0bb76a-..."}
Server running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Step 8 — First login

You'll see the landing page. Click **"Get Started"**.

On the login screen you have two options:

### Option A — Sign in with Google

1. Click **"Sign in with Google"**.
2. Pick the Google account whose email is set as `OWNER_EMAIL` in `.env.local`.
3. You'll be redirected back, signed in as **admin**.

### Option B — Employee ID

This requires that the email address (uppercased) exists in the `authorized_employees` Firestore collection. As the owner, you can add employees from the **Admin Panel** after you sign in via Option A.

---

## Troubleshooting

| Symptom                                                | Likely cause                                  | Fix                                                                      |
| ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `Firestore Admin SDK NOT initialized (missing config)` | `FIREBASE_PROJECT_ID` not set in `.env.local` | Re-check Step 3                                                          |
| `JWT_SECRET not set — using dev fallback`              | You're in dev. Acceptable for local.          | In production, set `JWT_SECRET` (Step 2).                                |
| `[GeminiProvider] No GEMINI_API_KEY set`               | Missing or wrong API key                      | Re-do Step 1                                                             |
| `Access Denied: Unauthorized` after login              | Email isn't in `authorized_employees`         | Sign in as `OWNER_EMAIL` first; you bypass this check.                   |
| `EADDRINUSE: address already in use 0.0.0.0:3000`      | Another process on port 3000                  | Kill it: Windows `netstat -ano                                           | findstr :3000`then`taskkill /PID <pid> /F` |
| Page loads but Firestore stays "offline"               | Auth domain mismatch                          | Re-check `VITE_FIREBASE_AUTH_DOMAIN` matches the one in Firebase Console |
| `tsx: command not found`                               | `npm install` didn't finish                   | Re-run `npm install`                                                     |

---

## What lives where

| File           | Purpose                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| `.env.local`   | **Your secrets.** Never commit. Contains keys filled in during this guide. |
| `.env.example` | Public template showing what variables are needed (committed to git).      |
| `AGENTS.md`    | Rules for the AI agent that's helping you on this project.                 |
| `PROGRESS.md`  | Auto-updated work log. Tells you what was done and what's still TODO.      |
| `SETUP.md`     | This file.                                                                 |

---

## Done?

Once `npm run dev` shows the server running and you can log in, you're set.

Tell the agent **"setup is done, GEMINI_API_KEY and JWT_SECRET are filled in"** and it'll continue with the remaining backlog.
