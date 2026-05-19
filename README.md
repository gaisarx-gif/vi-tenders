# Vision-OS — Vision Tenders Platform

> AI-powered web app to analyze the **Kuwait Today** (الكويت اليوم) gazette PDFs and manage tender announcements.

## Quick start

**Prerequisites**: Node.js ≥ 20, npm ≥ 10, Git, a Google account.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **First-time setup — paste your secrets**
   Follow the step-by-step guide in [`SETUP.md`](./SETUP.md). It walks you through:
   - getting a free Gemini API key,
   - generating a JWT secret,
   - confirming your Firebase web config,
   - filling `.env.local`.

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## Scripts

| Command                | What it does                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Start dev server (Vite + Express via `tsx`).                          |
| `npm run start`        | Start in production mode (`NODE_ENV=production`). Build first.        |
| `npm run build`        | Bundle the frontend with Vite to `dist/`.                             |
| `npm run preview`      | Serve the production build locally.                                   |
| `npm run typecheck`    | `tsc --noEmit` — fail on any TS error.                                |
| `npm run lint`         | ESLint (flat config, ESLint 9 + typescript-eslint).                   |
| `npm run lint:fix`     | Auto-fix what's safe.                                                 |
| `npm run format`       | Prettier — write changes.                                             |
| `npm run format:check` | Prettier — verify all files are formatted.                            |
| `npm run test`         | Vitest run (no tests yet — infra only, see backlog in `PROGRESS.md`). |
| `npm run test:ui`      | Vitest UI mode.                                                       |
| `npm run clean`        | Delete `dist/`.                                                       |
| `npm run docker:build` | Build a production Docker image locally.                              |

## Docker

Build the container locally:

```bash
npm run docker:build
```

Then run it with your environment file (do not commit secrets):

```bash
docker run --rm -p 3000:3000 --env-file .env.local vision-os
```

## Documentation

| File                                                   | Purpose                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [`SETUP.md`](./SETUP.md)                               | First-time setup: API keys, secrets, Firebase config (step-by-step) |
| [`AGENTS.md`](./AGENTS.md)                             | Conventions, security rules, free-tier limits, future direction     |
| [`PROGRESS.md`](./PROGRESS.md)                         | Auto-updated work log + backlog of TODOs                            |
| [`firestore.rules`](./firestore.rules)                 | Firestore security rules                                            |
| [`firebase-blueprint.json`](./firebase-blueprint.json) | Firestore collection schemas                                        |

## Stack

- **Frontend**: React 19 · TypeScript · Vite 6 · Tailwind 4 · shadcn/ui (`base-nova`) · `motion` · `recharts` · `lucide-react`
- **Backend**: Express 4 · `tsx` · `winston` · `helmet` · `express-rate-limit` · `cookie-parser` · `cors` · `jsonwebtoken` · `zod`
- **Database & Auth**: Firebase Firestore + Firebase Auth (Spark / free tier)
- **AI**: Google Gemini via `@google/genai` (free tier)
- **PDF / Excel**: `pdf-lib`, `xlsx`
- **Quality**: ESLint 9 (flat) · Prettier · TypeScript strict · Vitest + Testing Library + supertest

## Free tier — what you get without a card

| Service                   | Free quota                                |
| ------------------------- | ----------------------------------------- |
| Gemini 2.5 Flash          | 15 req/min · 1500 req/day · 1M tokens/day |
| Firebase Spark            | 50K Firestore reads/day · 1 GiB storage   |
| Firebase Auth             | unlimited Google sign-in                  |
| Firebase Hosting (deploy) | 10 GB storage · 360 MB/day transfer       |

See `AGENTS.md` for the full table.

## Project layout

See `AGENTS.md` § 2 for the annotated tree.

## Contributing / continuing the work

This codebase is being incrementally improved by an AI agent (Devin).

- Read `PROGRESS.md` first — it tells you what's done and what's queued.
- Read `AGENTS.md` for the rules of engagement.
- Don't edit `firestore.rules` without coordinating — security regression risk.
- Don't edit anything in `components/ui/**` by hand — that's shadcn-generated.

## Original README context

This project was bootstrapped from Google AI Studio. The original AI Studio app
URL was: <https://ai.studio/apps/8f0bb76a-1dd5-4bc2-8b03-ebcbc19d198e>
