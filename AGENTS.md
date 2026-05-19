# AGENTS.md — Rules for Devin & any agent working on Vision-OS

> **This file is the source of truth for project conventions.**
> Read it at the start of every session. Update it whenever a new convention is decided.

---

## 1. Project Overview

**Vision-OS** (a.k.a. _Vision Tenders Platform_) is an AI-powered web application that:

1. Analyzes the **Kuwait Today** (الكويت اليوم) official gazette PDFs.
2. Extracts tender announcements automatically using **Google Gemini**.
3. Lets authorized employees track, watchlist, and act on those tenders.
4. Provides a directory of partner **companies** and a calendar of **deadlines**.

**Stack** (do not change without explicit request):

| Layer            | Tech                                                      |
| ---------------- | --------------------------------------------------------- |
| Frontend         | React 19 + TypeScript + Vite 6                            |
| Styling          | Tailwind CSS v4 (`@theme` syntax) + shadcn/ui (base-nova) |
| Animations       | `motion` (formerly framer-motion)                         |
| State            | React local state + `useEffect` for now (see §10)         |
| Backend          | Express 4 + TypeScript via `tsx`                          |
| Database         | Firebase Firestore (Spark/free tier)                      |
| Auth             | Firebase Auth (Google) + JWT cookies for employee IDs     |
| AI               | Google Gemini via `@google/genai`                         |
| PDF              | `pdf-lib` for chunk-splitting before AI extraction        |
| Excel            | `xlsx`                                                    |
| Logging          | `winston`                                                 |
| Validation       | `zod` (v4)                                                |
| Testing (future) | Vitest + Testing Library + supertest                      |
| Routing (future) | `@tanstack/router` (see §10)                              |

---

## 2. Folder Structure (current — to be improved in later phases)

```
.
├── components/            shadcn/ui primitives (don't edit these by hand)
├── hooks/                 generic hooks (use-mobile)
├── lib/                   shared utilities (cn helper)
├── scripts/               one-off scripts (migrate-uids.ts)
├── server/                server-only code
│   ├── ai/                AIProvider interface + Gemini impl + prompts
│   ├── pipeline/          parsers + normalizer + validator + enricher
│   └── routes/            Express routers (only ingest.ts so far)
├── src/                   React app
│   ├── components/        feature components (Dashboard, TenderTable, …)
│   ├── lib/               firebase.ts, normalizer.ts, translations.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── server.ts              monolithic server entry (1010 lines — to split)
├── firebase-applet-config.json   ← will be REMOVED in Phase 2
├── firestore.rules        Firestore security rules
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js       flat config (ESLint 9)
├── .prettierrc
├── vitest.config.ts
├── vitest.setup.ts
├── .env.example           public template
├── .env.local             your real secrets (gitignored)
├── PROGRESS.md            auto-updated work log
├── SETUP.md               step-by-step setup for humans
└── AGENTS.md              ← this file
```

---

## 3. Workflow rules for the agent

### 3.1 Always

- ✅ Read `PROGRESS.md` before starting any task. Append a new row when finishing.
- ✅ Update the `todo_write` list as you go.
- ✅ Run `npm run typecheck` after every meaningful change.
- ✅ Use file references (`<ref_file>` / `<ref_snippet>`) when explaining code to the user.
- ✅ Use **free tier** services only (see §8).
- ✅ When the user must add manual data (API keys, secrets, config), give **step-by-step instructions** with exact URLs in `SETUP.md` and surface a `⏸ AWAITING USER` row in `PROGRESS.md`.
- ✅ Suggest 2–3 free alternatives for any new dependency, then pick the best with reasoning.

### 3.2 Never

- ❌ Commit anything matching `.env*` (other than `.env.example`).
- ❌ Hardcode API keys, secrets, or personal emails. Use `process.env` / `import.meta.env`.
- ❌ Modify `firestore.rules` without telling the user — security regression risk.
- ❌ Modify files under `components/ui/**` (shadcn-generated). Run the shadcn CLI instead.
- ❌ Delete `package-lock.json`. If lock changes, commit it.
- ❌ Use a paid service / dependency without asking.
- ❌ `console.log` for production logging on the server — use the `winston` logger.

### 3.3 When in doubt

- Search the codebase first (grep / find / read).
- Check existing patterns before introducing a new one.
- Ask the user with `ask_user_question` if the choice has trade-offs.

---

## 4. Code style

- **Indentation**: 2 spaces, never tabs.
- **Quotes**: single quotes for JS/TS, double quotes for JSX attributes.
- **Trailing commas**: yes (`"trailingComma": "all"`).
- **Imports**: side-effect imports first, then external, then internal (`@/...`), then relative (`./...`). One blank line between groups.
- **Component files**: one component per file, `PascalCase.tsx`.
- **Hook files**: `use-kebab-case.ts` or `useCamelCase.ts` — match what's already there per folder.
- **Server files**: `kebab-case.ts`.
- **Don't add comments unless asked**, except JSDoc on exported APIs.
- **No emojis** in source code or commit messages.

### 4.1 Imports & path aliases

- `@/*` resolves to repo root (per `tsconfig.json paths`). Use it for cross-tree imports.
- Prefer relative imports inside the same feature folder.

### 4.2 React conventions

- **No `React.FC`** — use plain function declarations with typed props.
- **Hooks at the top**, derived data via `useMemo`, side effects via `useEffect` (with proper deps).
- **No business logic in JSX** — extract to consts above `return`.
- **Always render an empty/loading state** for data fetched async.

### 4.3 TypeScript

- `strict: true` is on. Don't suppress with `// @ts-ignore`. Prefer narrow types.
- `as any` is allowed only at boundaries we don't control (raw `req.body` _before_ Zod parsing). Then immediately validate.
- Prefer `interface` for public shapes, `type` for unions / aliases.
- Export shared types from `src/types.ts` (frontend) and per-module on the server.

---

## 5. Internationalization & RTL

- The app is **bilingual Arabic ↔ English**. RTL is real, not cosmetic.
- All user-facing strings come from `src/lib/translations.ts`. **Never hardcode strings in components** (only acceptable inside admin/internal screens that won't ship to Arab users).
- For RTL layouts use:
  - `dir={language === 'ar' ? 'rtl' : 'ltr'}` on container blocks
  - Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) over `ml-`, `pl-`, `left-`
  - The `rtl:` Tailwind v4 variant for direction-specific overrides
- Arabic text needs higher line-height (`leading-relaxed` minimum). Use `font-sans` (Inter handles Arabic ok; for production consider Cairo/Tajawal).

---

## 6. Security do's & don'ts

| Do                                                            | Don't                                                |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| Read all secrets from `process.env` / `import.meta.env`       | Hardcode keys in source or JSON files                |
| Validate every `req.body` with **Zod** before using it        | Trust client input directly                          |
| Use `httpOnly`, `secure` (in prod), `sameSite: 'lax'` cookies | Use `localStorage` for tokens                        |
| Re-check role from Firestore in `/api/me`                     | Trust the role baked into the JWT past initial issue |
| Set CORS to specific origins in production                    | Use `cors({origin: true})` (allow-all) in production |
| Keep `helmet` enabled with sane CSP                           | Disable security headers wholesale                   |
| Rate-limit auth and sensitive endpoints                       | Leave them open                                      |

### Firebase Auth UID strategy

- Server uses `getCanonicalUid({ firebaseUid?, employeeId? })` (in `server.ts`):
  - Google OAuth → return `firebaseUid` (Firebase Auth UID, stable)
  - Employee ID → return `emp_<sha256(employeeId)>` (deterministic hash)
- All Firestore documents (`subscriptions`, `notifications`, `calendar_events`) store `userId = canonicalUid`.
- Migration script: `scripts/migrate-uids.ts` (idempotent, supports `--dry-run`).

---

## 7. Firestore — collections, rules, listeners

| Collection             | Schema (see `firebase-blueprint.json`) | Writes via                  |
| ---------------------- | -------------------------------------- | --------------------------- |
| `users`                | User                                   | self or admin (rules)       |
| `authorized_employees` | `{employeeId, role, createdAt}`        | admin only (rules)          |
| `issues`               | TenderIssue (with embedded tenders[])  | server (Admin SDK bypasses) |
| `tenders`              | (currently embedded in issues)         | server                      |
| `subscriptions`        | Subscription                           | self or admin (rules)       |
| `notifications`        | Notification                           | server (admin SDK)          |
| `calendar_events`      | CalendarEvent                          | self or admin (rules)       |
| `companies`            | Company                                | TODO: tighten to admin only |

### Real-time pattern

- Already used for `issues` in `App.tsx` (`onSnapshot`).
- **TODO** (Phase 4): convert `notifications`, `calendar_events`, `companies`, `subscriptions` from polling to listeners — the client SDK is already loaded.

---

## 8. Free-tier limits — never exceed without telling user

| Service             | Free tier limit                                         | What we use it for              |
| ------------------- | ------------------------------------------------------- | ------------------------------- |
| Gemini 2.5 Flash    | 15 RPM, 1500 req/day, 1M tokens/day                     | PDF tender extraction + summary |
| Firebase Spark      | 50K reads, 20K writes, 20K deletes / day; 1 GiB storage | Firestore                       |
| Firebase Auth       | unlimited Google sign-in                                | Authentication                  |
| Firebase Hosting    | 10 GB storage, 360 MB/day transfer (1 site)             | Future deploy                   |
| GitHub              | unlimited private repos                                 | Source hosting                  |
| Vercel (alt deploy) | 100 GB transfer/mo, hobby plan                          | Alternative deploy              |
| Resend (future)     | 100 emails/day                                          | Notification emails             |
| Sentry (future)     | 5K errors/mo                                            | Error tracking                  |

When usage approaches a limit, surface a `⚠ FREE-TIER WARNING` row in `PROGRESS.md`.

---

## 9. Future-direction decisions (locked in but not yet implemented)

These were explicitly chosen by the user during planning. Honor them when you reach the corresponding phase.

| Topic               | Choice                                        | Phase    |
| ------------------- | --------------------------------------------- | -------- |
| Routing             | `@tanstack/router` (type-safe)                | Phase 4  |
| Test stack          | `vitest` + Testing Library + supertest        | Phase 7  |
| State (when needed) | React Context first; Zustand if it grows      | Phase 4+ |
| Email (when needed) | Resend free tier                              | future   |
| Errors              | Sentry free tier                              | future   |
| Deploy              | Firebase Hosting (already in stack)           | future   |
| Owner email default | `aawad39506@gmail.com` (kept as dev fallback) | Phase 2  |

---

## 10. Mega-files status (was: known mega-files to split)

| File                               | Lines | Status                                                                 |
| ---------------------------------- | ----- | ---------------------------------------------------------------------- |
| `server.ts`                        | 76    | ✓ Split: routes in `server/routes/*`, Vite/serve in `server/serve-app.ts` |
| `src/components/Dashboard.tsx`     | 416   | ⚠ Already uses `src/views/*` for each tab; remains as container/orchestrator |
| `src/components/TenderDetails.tsx` | 120   | ✓ Split into 5 sub-components under `src/components/TenderDetails/*`   |

Remaining mega-files (not in original list, but large):
- `src/components/Dashboard.tsx` (416 lines) — orchestrator + upload logic; **can add new tabs via `src/views/<Tab>View.tsx` without touching this file**

---

## 11. Commit style

```
feat(scope): short imperative summary

Optional body explaining "why" not "what".

Generated with [Devin](https://cli.devin.ai/docs)
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
```

`scope` examples: `auth`, `dashboard`, `pipeline`, `firestore`, `ui`, `infra`.

---

## 12. Verification checklist (run before claiming a task done)

```bash
npm run typecheck     # tsc --noEmit, must be green
npm run lint          # ESLint, must be green (warnings tolerated for now)
npm run format:check  # Prettier
npm run test          # Vitest (no tests yet, will pass with no-test-found)
npm run build         # vite build, must succeed
npm run dev           # smoke check: server logs "Firestore connected"
```

If any of these fail and the failure is not addressed, the task is **not done**.

---

## 13. When you finish a task

1. Append to `PROGRESS.md` (timestamp / phase / files / status / next).
2. Mark the matching todo as `completed`.
3. If a new convention emerged, add it here.
4. If a manual user action is required, mark it `⏸ AWAITING USER` in `PROGRESS.md` and stop.
