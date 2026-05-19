# PROGRESS.md — Vision-OS automated work log

> **This file is appended to automatically by the Devin agent after every completed task.**
> It is the single source of truth for "where are we?" — read it at the start of any session.
> Format: `[ISO timestamp] · Phase X.Y · Task · Files · Status · Next step`
>
> **Status legend**:
>
> - ✓ done · ✗ failed · ⏸ AWAITING USER · ⚠ partial / has TODOs · ⊘ skipped (out of current scope)

---

## Active scope

**Approved phases**: 0, 1, 2, 3, 4 (all milestones complete as of 2026-05-18).
**All 4 milestones complete** — see `PROJECT_MAP.md` for next recommended work: split mega-files (server.ts, Dashboard.tsx, TenderDetails.tsx), add @tanstack/react-router, upgrade vulnerable deps.

---

## Live log (newest at top)

| When                   | Phase    | Task                                                                                                                                             | Files                                                                                                                | Status                                                            | Next                                |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| 2026-05-18T21:00:00+03 | Phase 3  | Rewrite LoginPage.tsx in src/views/: single Google sign-in button, no email/password, Google SVG icon, loading/error states, centered card UI | `src/views/LoginPage.tsx` (new), `src/App.tsx`, deleted `src/components/LoginPage.tsx` | ✓ | Next: add tanstack/react-router, route views, UX polish |
| 2026-05-18T20:55:00+03 | Phase 3  | Create src/lib/firebase.ts with getApps() guard + GoogleAuthProvider; rewrite AuthContext with user/loading/signInWithGoogle/signInWithEmployeeId/signOut/refreshUser; add User type to types.ts; update App.tsx and LoginPage.tsx consumers | `src/lib/firebase.ts`, `src/contexts/AuthContext.tsx`, `src/types.ts`, `src/App.tsx`, `src/components/LoginPage.tsx` | ✓ | Next: add tanstack/react-router, route views, UX polish |
| 2026-05-18T20:45:00+03 | infra    | Split mega-files: extract server Vite/serve logic to server/serve-app.ts; split TenderDetails.tsx (593→120 lines) into 5 sub-components (Header, Description, Timeline, Documents, Watchlist) under src/components/TenderDetails/ | `server/serve-app.ts` (new), `server.ts`, `src/components/TenderDetails.tsx`, `src/components/TenderDetails/TenderHeader.tsx`, `src/components/TenderDetails/TenderDescription.tsx`, `src/components/TenderDetails/TenderTimeline.tsx`, `src/components/TenderDetails/TenderDocuments.tsx`, `src/components/TenderDetails/TenderWatchlist.tsx` | ✓ | Choose next: router, deps, or UI polish |
| 2026-05-18T20:30:00+03 | infra    | Create firestore.indexes.json (composite indexes for tenders/notifications/subscriptions/calendar_events) and firebase.json config | `firestore.indexes.json`, `firebase.json` | ✓ | Split mega-files |
| 2026-05-18T20:15:00+03 | M4       | Milestone 4 — Hardening, Tests, Docker. Unit tests for normalizer/validator/enricher/uid (26 tests, 4 files), multi-stage Dockerfile, .dockerignore, CI workflow, createApp() factory | `tests/unit/normalizer.test.ts`, `tests/unit/validator.test.ts`, `tests/unit/enricher.test.ts`, `tests/unit/uid.test.ts`, `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`, `server.ts` | ✓ | All milestones complete |
| 2026-05-18T18:30:00+03 | M1       | Milestone 1 — Code Stability. Fix 8 TS errors: setEmployeeId, AppSidebar props, excel type, console→logger, STATUS_TO_AR dedup, use-mobile restore | `src/App.tsx`, `src/components/AppSidebar.tsx`, `server/pipeline/parsers/excel.ts`, `server/pipeline/enricher.ts`, `server/pipeline/index.ts`, `shared/normalizer.ts`, `hooks/use-mobile.ts`, `server/routes/ingest.ts` | ✓ | M2: Firestore subcollection migration |
| 2026-05-18T19:30:00+03 | M3       | Milestone 3 — State management + API client. Created AuthContext, LanguageContext, ThemeContext, api.ts client, refactored App.tsx (50% less code), updated LoginPage | `src/lib/api.ts`, `src/contexts/AuthContext.tsx`, `src/contexts/LanguageContext.tsx`, `src/contexts/ThemeContext.tsx`, `src/App.tsx`, `src/components/LoginPage.tsx` | ✓ | M4: Hardening + tests + Docker |
| 2026-05-18T19:00:00+03 | M2       | Milestone 2 — Firestore subcollection migration. Tenders now in `tenders/{id}` collection. Updated all routes, schemas, client types, App.tsx listener, migration script | `server/schemas/issues.ts`, `server/schemas/tenders.ts`, `server/routes/issues.ts`, `server/routes/tenders.ts`, `server/routes/admin-tenders.ts`, `server/routes/organizations.ts`, `src/types.ts`, `src/App.tsx`, `src/components/Dashboard.tsx`, `src/views/OverviewView.tsx`, `scripts/migrate-tenders.ts` | ✓ | M3: State management + API client |
| 2026-05-18T18:30:00+03 | M1       | Milestone 1 — Code Stability. Fix 8 TS errors: setEmployeeId, AppSidebar props, excel type, console→logger, STATUS_TO_AR dedup, use-mobile restore | `src/App.tsx`, `src/components/AppSidebar.tsx`, `server/pipeline/parsers/excel.ts`, `server/pipeline/enricher.ts`, `server/pipeline/index.ts`, `shared/normalizer.ts`, `hooks/use-mobile.ts`, `server/routes/ingest.ts` | ✓ | M2: Firestore subcollection migration |
| 2026-05-18T13:10:00+03 | 3.17     | Patch direct production dependency vulnerability in `express-rate-limit`; update lockfile                                                      | `package.json`, `package-lock.json`                                                                                   | ✓                                                                 | Continue refactor + audit follow-up |
| 2026-05-18T12:45:00+03 | 3.16     | Fix production runtime packaging: move `tsx` and `cross-env` into dependencies; make `server/lib/env.ts` respect `PORT`                      | `package.json`, `server/lib/env.ts`, `README.md`                                                                      | ✓                                                                 | Continue refactor + audit follow-up |
| 2026-05-18T12:00:00+03 | 3.13     | Improve tender update path with issueId optimization to avoid full issue scans; fix SmartAlerts notification hook import                          | `src/components/Dashboard.tsx`, `server/routes/tenders.ts`, `src/components/SmartAlerts.tsx`                         | ✓                                                                 | Continue refactor + audit follow-up |
| 2026-05-17T12:00:00+03 | 3.12     | Secure company creation endpoint and enforce real admin verification; unify notification fetching with shared hook                            | `server/routes/companies.ts`, `server/middleware/auth.ts`, `src/components/SmartAlerts.tsx`                          | ✓                                                                 | Continue refactor + audit follow-up |
| 2026-05-15T14:58:00+03 | verify   | Phase 3 verification: typecheck/lint/format/test/build/dev all green; lint warnings 189→157                                                      | n/a                                                                                                                  | ✓                                                                 | Phase 3 closed; Phases 4+ backlog   |
| 2026-05-15T14:55:00+03 | 3.11     | Consolidate notifications polling: new `hooks/use-notifications.ts`; lift state to App.tsx; remove duplicate polling from AppSidebar + Dashboard | `hooks/use-notifications.ts` (new), `src/App.tsx`, `src/components/AppSidebar.tsx`, `src/components/Dashboard.tsx`   | ✓                                                                 | Final verify                        |
| 2026-05-15T14:52:00+03 | 3.10     | Remove mock sections in Dashboard overview; replace Kuwait Alyoum Feed with real "Latest Issues" widget                                          | `src/components/Dashboard.tsx`                                                                                       | ✓                                                                 | 3.11 notifications dedup            |
| 2026-05-15T14:48:00+03 | 3.9      | Replace picsum.photos placeholders in Logo (Eye icon) and Dashboard top-right avatar (User icon)                                                 | `src/components/Logo.tsx`, `src/components/Dashboard.tsx`                                                            | ✓                                                                 | 3.10 mock sections                  |
| 2026-05-15T14:45:00+03 | 3.8      | Wire empty global Search input to filter `filteredTenders` by tenderNo / description / org names; pipe through to overview + all-tenders         | `src/components/Dashboard.tsx`                                                                                       | ✓                                                                 | 3.9 picsum placeholders             |
| 2026-05-15T14:42:00+03 | 3.7      | AppSidebar: remove dead Activity Log, Archive, separate User Management, Permissions menu items                                                  | `src/components/AppSidebar.tsx`                                                                                      | ✓                                                                 | 3.8 search input                    |
| 2026-05-15T14:40:00+03 | 3.6      | Dedup byte-identical normalizers: move to `shared/normalizer.ts`; update 5 callers                                                               | `shared/normalizer.ts` (new), 5 callers updated; deleted `src/lib/normalizer.ts` and `server/pipeline/normalizer.ts` | ✓                                                                 | 3.7 sidebar items                   |
| 2026-05-15T14:38:00+03 | 3.5      | ErrorBoundary already clean; fixed remaining `as any` in CalendarView purpose select                                                             | `src/components/CalendarView.tsx`                                                                                    | ✓                                                                 | 3.6 normalizers                     |
| 2026-05-15T14:36:00+03 | 3.4      | Switch Gemini model `gemini-3-flash-preview` (preview) → `gemini-2.5-flash` (stable, free); add `GEMINI_MODEL` env override                      | `server/ai/providers/gemini.ts`, `.env.example`                                                                      | ✓                                                                 | 3.5 ErrorBoundary                   |
| 2026-05-15T14:34:00+03 | 3.3      | Delete dead `src/components/Login.tsx` (only LoginPage.tsx is wired)                                                                             | deleted `src/components/Login.tsx`                                                                                   | ✓                                                                 | 3.4 Gemini model                    |
| 2026-05-15T14:33:00+03 | 3.2      | Remove duplicated 'Add Tender' modal in Dashboard.tsx (102 dead lines)                                                                           | `src/components/Dashboard.tsx`                                                                                       | ✓                                                                 | 3.3 dead Login.tsx                  |
| 2026-05-15T14:32:00+03 | 3.1      | Render `<TenderDetails>` when `selectedTender` is set; add `selectedIssueId` memo; wrap `<main>` body in ternary                                 | `src/components/Dashboard.tsx`                                                                                       | ✓                                                                 | 3.2 dup modal                       |
| 2026-05-15T13:35:00+03 | verify   | Final verification: typecheck/lint/format/test/build/dev all green                                                                               | `package.json` (added `--passWithNoTests`)                                                                           | ✓                                                                 | Phase 0–2 closed; Phases 3+ backlog |
| 2026-05-15T05:03:00+03 | 2.6      | Update README.md to point to SETUP.md and document Phase 0–2 stack                                                                               | `README.md`                                                                                                          | ✓                                                                 | Final verification                  |
| 2026-05-15T05:02:00+03 | 2.5      | Tighten CORS to `ALLOWED_ORIGIN` env in prod; re-enable helmet CSP                                                                               | `server.ts`                                                                                                          | ✓                                                                 | 2.6 README.md                       |
| 2026-05-15T05:01:00+03 | 2.4      | Add Zod schemas to `/api/admin/employees` POST + `/api/admin/merge-organizations` POST                                                           | `server.ts`                                                                                                          | ✓                                                                 | 2.5 CORS + helmet                   |
| 2026-05-15T05:00:00+03 | 2.3      | Tighten `firestore.rules` (admin-only writes on companies, role enum, ownership checks)                                                          | `firestore.rules`                                                                                                    | ✓                                                                 | 2.4 Zod schemas                     |
| 2026-05-15T04:59:00+03 | 2.2      | Replace hardcoded owner email with `OWNER_EMAIL` env var (default kept as dev fallback)                                                          | `server.ts`, `test-admin.ts`                                                                                         | ✓                                                                 | 2.3 firestore.rules                 |
| 2026-05-15T04:58:00+03 | 2.1      | Move Firebase config to `.env.local`; delete `firebase-applet-config.json`                                                                       | `.env.local`, `src/lib/firebase.ts`, deleted `firebase-applet-config.json`                                           | ✓                                                                 | 2.2 owner email                     |
| 2026-05-15T04:57:00+03 | 1.7      | Update `.devin/config.local.json` permissions for non-interactive flows                                                                          | `.devin/config.local.json`                                                                                           | ✓                                                                 | 2.1 Firebase env                    |
| 2026-05-15T04:56:00+03 | 1.6      | Create `arabic-rtl-ui` skill (Tailwind logical props + RTL pitfalls)                                                                             | `.devin/skills/arabic-rtl-ui/SKILL.md`                                                                               | ✓                                                                 | 1.7 permissions                     |
| 2026-05-15T04:55:00+03 | 1.5      | Create `firebase-security` skill (rules patterns + auth flow)                                                                                    | `.devin/skills/firebase-security/SKILL.md`                                                                           | ✓                                                                 | 1.6 RTL skill                       |
| 2026-05-15T04:54:00+03 | 1.4      | Create `vision-os` skill (domain glossary, schema, pipeline)                                                                                     | `.devin/skills/vision-os/SKILL.md`                                                                                   | ✓                                                                 | 1.5 firebase skill                  |
| 2026-05-15T04:53:00+03 | 1.3      | Create SETUP.md (step-by-step manual setup guide)                                                                                                | `SETUP.md`                                                                                                           | ✓                                                                 | 1.4 vision-os skill                 |
| 2026-05-15T01:35:00+03 | 0.5      | `npm install` completed; `tsc --noEmit` green                                                                                                    | `node_modules/`, `package-lock.json`                                                                                 | ✓                                                                 | 1.1 AGENTS.md                       |
| 2026-05-15T01:10:00+03 | 0.4      | Create eslint.config.js, .prettierrc, .prettierignore, vitest.config.ts, vitest.setup.ts                                                         | 5 files                                                                                                              | ✓                                                                 | 0.5 npm install                     |
| 2026-05-15T01:05:00+03 | 0.3      | Tighten tsconfig.json (strict, etc.)                                                                                                             | `tsconfig.json`                                                                                                      | ✓                                                                 | 0.4 lint/format/test config         |
| 2026-05-15T01:00:00+03 | 0.2      | Update package.json (name, scripts, deps; remove duplicates)                                                                                     | `package.json`                                                                                                       | ✓                                                                 | 0.3 tsconfig                        |
| 2026-05-15T00:55:00+03 | 0.1      | Create .gitignore, .env.example, .env.local                                                                                                      | `.gitignore`, `.env.example`, `.env.local`                                                                           | ⏸ AWAITING USER (paste GEMINI_API_KEY + JWT_SECRET; see SETUP.md) | 0.2 package.json                    |
| 2026-05-15T00:30:00+03 | analysis | Deep code review of full project                                                                                                                 | n/a (read-only)                                                                                                      | ✓                                                                 | 0.1 bootstrap                       |

---

## ⏸ AWAITING USER — manual actions required

When you (the user) complete one of these, ping the agent and it will continue.

- [ ] **GEMINI_API_KEY** — replace `TODO_PASTE_GEMINI_API_KEY_HERE` in `.env.local` with your key. See `SETUP.md` step 1.
- [ ] **JWT_SECRET** — replace `TODO_PASTE_RANDOM_BASE64_SECRET_HERE` in `.env.local` with a generated secret. See `SETUP.md` step 2.

(The Firebase web config in `.env.local` is already filled in with the values that were committed in the old `firebase-applet-config.json`. They are public per Firebase design — protection lives in `firestore.rules` + future App Check.)

---

## Backlog (out of current scope, queued for future phases)

### Phase 3 — Critical bug fixes ✓ DONE (2026-05-15)

- [x] **TenderDetails never rendered** — Dashboard.tsx imports it but never returns `<TenderDetails>`. Every tender click is a dead action. _Fix_: render `selectedTender` view conditionally with proper back navigation.
- [x] **"Add Tender" modal is duplicated in Dashboard.tsx** (lines 500-590 and 592-682). Remove the duplicate copy.
- [x] **Login.tsx is dead code** — only LoginPage.tsx is wired in. Delete `src/components/Login.tsx`.
- [x] **Two byte-identical normalizers** — `src/lib/normalizer.ts` and `server/pipeline/normalizer.ts`. Move to a `shared/normalizer.ts` and import from both sides.
- [x] **Gemini model name `gemini-3-flash-preview` is invalid** — verify and replace with the current free model (`gemini-2.5-flash` likely). _Fix_: switched to stable `gemini-2.5-flash`; added `GEMINI_MODEL` env override.
- [x] **AppSidebar dead menu items** — Activity Log, Archive, User Management (separate from Admin Panel), Permissions have no `onClick`. Remove or wire. _Fix_: removed all four (Admin Panel covers user management).
- [x] **Empty global Search input** in Dashboard top bar — wire to filter or remove. _Fix_: wired to `filteredTenders` (tenderNo / description / org names); now flows through to overview preview + all-tenders.
- [x] **`picsum.photos` placeholders in Logo and Dashboard avatars** — replace with real SVG / initials fallback. _Fix_: Logo uses `Eye` icon in primary-tinted square; top-right avatar uses `User` icon.
- [x] **Mock data in Dashboard overview** — fake "Companies Reference", fake "Activity Log", fake "Kuwait Alyoum Feed" rendered with hardcoded data. Remove or back with real data. _Fix_: removed Companies Reference and Activity Log (no real data source); replaced Kuwait Alyoum Feed with real "Latest Issues" widget backed by `issues` prop.
- [x] **Duplicate notification polling** — both AppSidebar and Dashboard fetch `/api/notifications` every 30s. Consolidate into one provider/hook. _Fix_: new `hooks/use-notifications.ts` lifted to App.tsx; AppSidebar's polling was 100% wasted (data never used in render) — removed entirely. Dashboard now reads `unreadCount` via prop.
- [x] **`@types/react`/`@types/react-dom` missing → ErrorBoundary uses `React.Component as any`** — already clean (no `as any` in ErrorBoundary). Bonus: fixed remaining `as any` in `CalendarView` (typed to `CalendarEvent['purpose']`).
- [x] **`/api/admin/employees` POST** — body never validated with Zod. Add schema. (Done in Phase 2.4.)
- [x] **`/api/admin/merge-organizations` POST** — body never validated. Add schema. (Done in Phase 2.4.)

### Phase 4 — Architectural refactor

- [ ] **Decompose `server.ts` (1010 lines)** into `server/middleware/{auth,rate-limit,error,logger}.ts`, `server/lib/{firebase-admin,jwt,uid}.ts`, `server/routes/{auth,me,employees,subscriptions,notifications,calendar,companies,tenders,issues,organizations}.ts`, `server/schemas/*.ts`.
- [ ] **Decompose `Dashboard.tsx` (1055 lines)** into `src/views/{Overview,AllTenders,Analysis,Import,Notifications,Admin}View.tsx` and `src/views/_layout/DashboardShell.tsx`.
- [ ] **Decompose `TenderDetails.tsx` (468 lines)** into description / timeline / documents / watchlist subsections.
- [ ] **Add `@tanstack/router`** — replace `activeTab` strings with URL routes (`/`, `/tenders`, `/tenders/:id`, `/admin`, …).
- [ ] **API client** at `src/lib/api.ts` — typed wrapper around `fetch`, central error handling, abort controllers, retries.
- [ ] **Replace polling with Firestore real-time listeners** for `notifications`, `calendar_events`, `companies`, `subscriptions`.
- [ ] **Auth Context** — `AuthContext`, `ThemeContext`, `LanguageContext` to stop prop-drilling.
- [ ] **`useFirestoreCollection` / `useFirestoreDoc` hooks** — generic real-time data hooks.

### Phase 5 — UX / UI

- [ ] **Theme system** — replace hardcoded `text-slate-900`, `bg-[#1e293b]`, etc. with CSS variables so dark/light theme actually works everywhere.
- [ ] **RTL pass** — switch all `pl-`, `pr-`, `ml-`, `mr-`, `text-left`, `left-`, `right-` to logical equivalents (`ps-`, `pe-`, `ms-`, `me-`, `text-start`, `start-`, `end-`).
- [ ] **Loading skeletons** for every async data view (shadcn `Skeleton` component already imported).
- [ ] **Empty states** — consistent design across views.
- [ ] **Mobile responsive pass** — breakpoints 375 / 768 / 1280.
- [ ] **Real Logo SVG** — replace picsum placeholder.
- [ ] **Avatar fallback** — `Avatar` component with initials (already in shadcn).
- [ ] **Accessibility** — ARIA labels on icon buttons, keyboard focus, color contrast, `aria-live` for toasts.
- [ ] **Typography scale unification** — single set of weights and sizes (currently mixes `font-bold` and `font-black` arbitrarily).

### Phase 6 — Logic & data integrity

- [ ] **Excel import** — currently the client `ExcelImport.tsx` runs its own normalizer then POSTs to `/api/admin/issues`, bypassing the server pipeline. Route it through `/api/ingest/excel` instead so all paths converge on one pipeline.
- [ ] **Date validation** — Zod regex for ISO date strings on every relevant field.
- [ ] **Unique constraint** on tender `tenderNo` per issue.
- [ ] **Firestore transactions** for `update-tender-status` and `merge-organizations` to avoid race conditions.
- [ ] **Pagination** for `/api/notifications`, `/api/calendar-events`, `/api/companies`, `/api/admin/employees`.
- [ ] **Trim & lowercase** emails / employee IDs at the boundary.

### Phase 7 — Tests (infra ready in Phase 0)

- [ ] Unit: `normalizer`, `validator`, `enricher`, `getCanonicalUid`, `parseExcel`, `parseManual`.
- [ ] Component: `LoginPage`, `TenderTable`, `ExcelImport`, `Watchlist` happy-path renders.
- [ ] API: 1 supertest suite per route group.
- [ ] (Optional) E2E with Playwright for the login → upload → see-tenders flow.

---

## Verification log

| When                   | Command                | Result | Notes                                                                             |
| ---------------------- | ---------------------- | ------ | --------------------------------------------------------------------------------- |
| 2026-05-15T14:58:00+03 | `npm run typecheck`    | ✓      | `tsc --noEmit` exits 0, no errors                                                 |
| 2026-05-15T14:58:00+03 | `npm run lint`         | ✓      | 0 errors, **157 warnings** (down from 189 after Phase 3 cleanup)                  |
| 2026-05-15T14:58:00+03 | `npm run format:check` | ✓      | All matched files use Prettier code style                                         |
| 2026-05-15T14:58:00+03 | `npm run test`         | ✓      | Pass-with-no-tests (no test files yet — Phase 7)                                  |
| 2026-05-15T14:58:00+03 | `npm run build`        | ✓      | `vite build` produces `dist/` in ~35s; chunk-size warning noted (Phase 5 backlog) |
| 2026-05-15T14:58:00+03 | `npm run dev`          | ✓      | Server boots on `:3000`, `Firestore Admin SDK initialized`, `/api/me` returns 401 |
| 2026-05-15T13:35:00+03 | `npm run typecheck`    | ✓      | (Phase 0–2 close) `tsc --noEmit` exits 0, no errors                               |
| 2026-05-15T13:35:00+03 | `npm run lint`         | ✓      | (Phase 0–2 close) 0 errors, 189 warnings                                          |
| 2026-05-15T13:35:00+03 | `npm run format:check` | ✓      | (Phase 0–2 close) All matched files use Prettier code style                       |
| 2026-05-15T13:35:00+03 | `npm run test`         | ✓      | (Phase 0–2 close) Pass-with-no-tests                                              |
| 2026-05-15T13:35:00+03 | `npm run build`        | ✓      | (Phase 0–2 close) `vite build` produces `dist/` in ~30s                           |
| 2026-05-15T13:35:00+03 | `npm run dev`          | ✓      | (Phase 0–2 close) Server boots on `:3000`, `/api/me` returns 401                  |

---

## How to read this file

- **Newest entries at the top** of the live log.
- A row with `⏸ AWAITING USER` means the agent stopped on purpose and is waiting for you to act.
- Each backlog item starts with a `[ ]` checkbox; tick it `[x]` when done.
- The agent updates this file itself — you generally won't need to edit it, but you can.
