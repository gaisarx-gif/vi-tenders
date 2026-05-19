# PROJECT_MAP — Vision-OS Technical Blueprint

> Source of truth for architecture, data flow, and repair roadmap.
> Created: 2026-05-18 | Last verified: `npm run typecheck` = PASS (0 errors) ✅ M4 Complete

---

## [TECH_STACK]

### Frontend
| Layer | Library | Version | Status |
|-------|---------|---------|--------|
| Framework | React 19 | 19.2.5 | ✅ Active |
| Build | Vite 6 | 6.4.2 | ✅ Active |
| Styling | Tailwind CSS v4 | 4.2.2 → 4.3.0 available | ⚠ Minor upgrade available |
| Primitives | shadcn/ui (base-nova) | coupled w/ tailwind | ✅ Active |
| Icons | lucide-react | 0.546.0 | ⚠ Major upgrade to v1.16.0 available |
| Animation | motion (framer-motion successor) | 12.38.0 | ✅ Active |
| Charts | recharts | 3.8.1 | ✅ Active |
| Toasts | sonner | 2.0.7 | ✅ Active |

### Backend
| Layer | Library | Version | Status |
|-------|---------|---------|--------|
| Runtime | Node.js | 24.15.0 | ✅ Active |
| Server | Express 4 | 4.22.1 | ⚠ Express 5 (5.2.1) available but BREAKING |
| Runner | tsx | 4.21.0 | ✅ Active (dev/prod JIT) |
| Validation | Zod | 4.3.6 → 4.4.3 | ✅ Active |
| Logging | Winston | 3.19.0 | ✅ Active |

### AI Pipeline
| Layer | Library | Version | Status |
|-------|---------|---------|--------|
| SDK | @google/genai | 1.49.0 | ⚠ v2.4.0 major available (API changes) |
| Model | gemini-2.5-flash | — | ✅ Free tier |
| PDF | pdf-lib | 1.17.1 | ✅ Active |
| Excel | xlsx | 0.18.5 | ✅ Active |

### Infrastructure
| Layer | Tool | Version | Status |
|-------|------|---------|--------|
| Database | Firestore (Spark) | — | ✅ Active (free tier) |
| Auth | Firebase Auth (Google OAuth) | — | ✅ Active |
| Admin SDK | firebase-admin | 13.8.0 | ✅ Active |
| Client SDK | firebase | 12.12.0 | ✅ Active |
| Docker | node:22-alpine multi-stage | — | ✅ Active (M4) |
| CI/CD | .github/workflows/ci.yml | — | ✅ Active (M4) |

### Tooling
| Tool | Version | Status |
|------|---------|--------|
| TypeScript | 5.8.3 | ✅ TS6 available (major, defer) |
| ESLint | 9.39.4 | ⚠ v10.4.0 available (major, defer) |
| Prettier | 3.4.2 | ✅ Active |
| Vitest | 2.1.9 | ⚠ v4.1.6 available (major, defer) |
| supertest | 7.1.0 | ✅ Present but blocked by esbuild+Node24 TextEncoder issue |

---

## [SYSTEM_FLOW]

### Auth Flow
```
User → LandingPage → LoginPage
  ├─ Employee ID → POST /api/login { employeeId }
  │                → DB check authorized_employees
  │                → JWT cookie (httpOnly, 12h)
  │                → Firebase custom token
  │
  └─ Google OAuth → Firebase signInWithRedirect
                   → getRedirectResult → POST /api/login { idToken }
                   → Firebase verifyIdToken
                   → JWT cookie + Firebase custom token
```

### Data Ingestion Flow
```
PDF Upload:
  Dashboard.tsx → reader.readAsDataURL(file) → base64
               → POST /api/ingest/pdf { file, issueNumber, issueDate }
               → parsePdf() [pdf-lib split into 15-page chunks]
               → GeminiProvider.extractTendersFromPdf(chunk) [per chunk]
               → normalizeExtractions → validate → enrich
               → ReviewTable → user confirms
               → POST /api/admin/issues { issueNumber, date, tenders }
               → Firestore (Admin SDK bypasses rules)

Excel Import:
  Dashboard.tsx → POST /api/ingest/excel { file }
               → parseExcel() [xlsx → sheet_to_json]
               → normalize → validate → enrich
               → POST /api/admin/issues { issueNumber, date, tenders }
               → Firestore

Manual Entry:
  AddTenderModal → POST /api/tenders { ...tenderData }
                 → db.runTransaction → append to issues/manual-issue
```

### Read Flow (Client)
```
App.tsx (mount):
  GET /api/me → validate JWT → re-check role from Firestore
  onSnapshot(issues collection) → real-time listener

Dashboard:
  useMemo() derived data: allTenders, filteredTenders, selectedIssueId

Tab views:
  OverviewView → stats + latest issues + closing-soon
  AllTendersView → TenderTable with sort/filter
  AnalysisView → PDF upload + ReviewTable
  ImportView → ExcelImport component
  WatchlistView → per-user watchlist
  NotificationsView → useNotifications hook (poll 30s)
  CalendarView → fetch /api/calendar-events (poll 30s)
  CompaniesView → fetch /api/companies
  OrganizationsView → group by canonicalOrgId
  AdminView → employee management
```

---

## [ARCHITECTURE]

### Current (AS-IS)
```
E:\project\Vision-OS-main\
├── server.ts                    # Entry: Express + Vite middleware + routes
├── server/
│   ├── lib/                     # env, logger, firebase-admin, uid helpers
│   ├── middleware/               # auth (JWT), security (helmet/CORS), rate-limit, request-log
│   ├── routes/                   # 11 Express routers (health, auth, me, employees, ...)
│   ├── schemas/                  # 9 Zod schemas (auth, tenders, issues, calendar, ...)
│   ├── ai/                       # AIProvider interface + Gemini impl + prompts
│   └── pipeline/                 # parsers (pdf, excel, manual) + validator + enricher
├── src/
│   ├── App.tsx                   # Root: auth check, Firestore listener, prop-drill hub (277 lines)
│   ├── components/               # 16 feature components (Dashboard, TenderDetails, ...)
│   ├── views/                    # 10 view components (splits from original monolithic Dashboard)
│   └── lib/                      # firebase.ts client init, translations.ts (175 lines)
├── shared/
│   └── normalizer.ts             # status + org name normalizer (shared front+back)
├── hooks/
│   ├── use-notifications.ts      # poll-based notification hook
│   └── use-mobile.ts             # unused
├── components/ui/                # 18 shadcn-generated components (do NOT edit manually)
└── scripts/
    └── migrate-uids.ts           # canonical UID migration script
```

### Target (TO-BE)
```
E:\project\Vision-OS-main\
├── server/
│   ├── lib/                      # (unchanged: env, logger, firebase-admin, uid)
│   ├── middleware/                # (unchanged with minor fixes)
│   ├── routes/                   # Updated for Firestore subcollection model
│   ├── schemas/                  # Updated for subcollection model
│   ├── ai/                       # (unchanged)
│   └── pipeline/                 # (unchanged)
├── src/
│   ├── App.tsx                   # Slim: mount contexts + router
│   ├── contexts/                 # AuthContext, LanguageContext, ThemeContext
│   ├── lib/
│   │   ├── firebase.ts           # (unchanged)
│   │   ├── translations.ts       # (unchanged)
│   │   └── api.ts                # NEW: typed API client
│   ├── hooks/                    # useFirestoreCollection, useTenders, useAuth, ...
│   ├── components/               # Shared feature components
│   └── routes/                   # @tanstack/react-router route tree
├── shared/
│   ├── normalizer.ts             # (unchanged)
│   └── types.ts                  # Shared types (move from src/types.ts)
└── tests/                        # NEW: unit + integration + API tests
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Firestore subcollection** `issues/{issueId}/tenders/{tenderId}` | Eliminates 1MB doc limit, enables individual tender queries, parallel writes |
| **React Context** for Auth/Language/Theme | Stops prop drilling through 5+ levels |
| **Staged API client** (simple `api.ts` wrappers, not full React Query) | Simplicity First — enough to centralize fetch/error/retry |
| **Defer `@tanstack/react-router`** until Milestone 4 | Router adds complexity; tabs work for now while we stabilize data layer |
| **Defer major package upgrades** (Express 5, Vite 8, TS 6, ESLint 10) | Breaking changes create cascading failures; upgrade after stabilization |
| **Non-blocking logging** = winston with async transport | Already built — just enforce no `console.*` in prod code |
| **No queue system** (yet) | Gemini calls are synchronous but acceptable for current scale (<50 PDF pages) |

---

## [ORPHANS & PENDING]

### ✅ Milestone 1 — COMPLETED (2026-05-18)

| ID | File | Fix | Status |
|----|------|-----|--------|
| TS-1 | `src/App.tsx:82,113` | Added missing `const [employeeId, setEmployeeId] = useState('')` | ✅ FIXED |
| TS-2 | `src/components/AppSidebar.tsx:39-47` | Removed 6 dead destructured props | ✅ FIXED |
| TS-3 | `server/pipeline/parsers/excel.ts:18` | Used `sheet_to_json<T>()` + `satisfies RawExtraction` | ✅ FIXED |
| CQ-1 | `enricher.ts + index.ts` | `STATUS_TO_AR` moved to `shared/normalizer.ts` | ✅ FIXED |
| CQ-3 | `hooks/use-mobile.ts` | Restored (used by sidebar) | ✅ RESTORED |
| CQ-4 | `server/routes/ingest.ts` | 4 `console.error` → `logger.error` | ✅ FIXED |

**Gate M1**: `typecheck`=PASS | `lint --quiet`=PASS | `build`=PASS

### ✅ Milestone 2 — COMPLETED (2026-05-18)

| ID | Change | Files | Impact |
|----|--------|-------|--------|
| M2.1-2.9 | Full Firestore migration: tenders from embedded array → `tenders/{id}` collection | 10 files across schemas/routes/client | BREAKING |

**Gate M2**: `typecheck`=PASS | `build`=PASS | `scripts/migrate-tenders.ts --dry-run` functional

### ✅ Milestone 3 — COMPLETED (2026-05-18)

| ID | Change | Files |
|----|--------|-------|
| M3.1 | `src/lib/api.ts` — typed fetch wrapper (get/post/patch/del) | `src/lib/api.ts` (new) |
| M3.2a | AuthContext — centralized auth state, login, logout, checkSession | `src/contexts/AuthContext.tsx` (new) |
| M3.2b | LanguageContext — language state + translations | `src/contexts/LanguageContext.tsx` (new) |
| M3.2c | ThemeContext — theme toggle + dark class management | `src/contexts/ThemeContext.tsx` (new) |
| M3.3 | App.tsx refactored: uses contexts, ~50% less code, no prop-drilling for auth/lang/theme | `src/App.tsx` |
| M3.4 | LoginPage updated to use AuthContext's `login()` | `src/components/LoginPage.tsx` |

**Gate M3**: `typecheck`=PASS | `build`=PASS

### ✅ Milestone 4 — COMPLETED (2026-05-18)

| ID | Change | Files |
|----|--------|-------|
| M4.1 | Unit tests for normalizer (normalizeStatus, normalizeOrgName, STATUS_TO_AR) | `tests/unit/normalizer.test.ts` (new) |
| M4.2 | Unit tests for validator (valid batch, missing org, warning on tenderNo, invalid status, mixed) | `tests/unit/validator.test.ts` (new) |
| M4.3 | Unit tests for enricher (id, canonicalOrgId, createdAt, status mapping, unique ids, fallback) | `tests/unit/enricher.test.ts` (new) |
| M4.4 | Unit tests for UID (firebaseUid passthrough, emp_ hash determinism, uniqueness, preference) | `tests/unit/uid.test.ts` (new) |
| M4.5 | API integration test (skipped — esbuild + Node 24 TextEncoder incompatibility) | `tests/api/health.test.ts` (new, skipped) |
| M4.6 | Dockerfile: multi-stage (builder→production), node:22-alpine, non-root `USER node`, `npm ci` in prod | `Dockerfile` |
| M4.7 | .dockerignore (node_modules, dist, .git, .env, tests, scripts) | `.dockerignore` (new) |
| M4.8 | CI workflow: typecheck→lint→build→test→docker build on push/PR to main | `.github/workflows/ci.yml` (new) |
| M4.9 | Created `createApp()` factory for testability | `server.ts` |

**Gate M4**: `typecheck`=PASS | `lint --quiet`=PASS (0 errors, 8 warnings) | `build`=PASS | `test`=PASS (26/26 tests, 4 files) | `audit`=24 vulns (1 critical — protobufjs via firebase-admin, no upstream fix)

### Remaining Code Quality Issues
| ID | File | Issue | Severity |
|----|------|-------|----------|
| CQ-2 | `src/components/Dashboard.tsx:61` | Calendar polling TODO not completed | MEDIUM |

### Firestore Data Model (Week 2 Migration)
| Change | Impact | Files affected |
|--------|--------|---------------|
| `issues/{issueId}/tenders/{tenderId}` | All write/read paths change | 4 route files + 3 schemas + 4 frontend components |
| Remove `tenders[]` from issue document | Client reads change | `src/App.tsx:127-155`, `Dashboard.tsx:259-293`, all views |
| Migration script needed | One-time backfill | `scripts/migrate-tenders.ts` (new) |
| `PATCH /api/tenders/:id` complexity | O(n) → O(1) | `server/routes/tenders.ts` |
| `POST /api/admin/update-tender-status` | Transaction scope changes | `server/routes/admin-tenders.ts` |

### Missing Features (Deferred per Scope)
| Feature | Reason deferred | Target |
|---------|----------------|--------|
| `@tanstack/react-router` | Tabs work for now; avoid scope creep | Post-Milestone 4 |
| Email notifications | Requires Resend setup + external dependency | Future phase |
| Full App Check Firebase | Requires Firebase Console setup (manual) | Milestone 4 |
| Sentry error tracking | Requires account setup | Future phase |
| E2E Playwright tests | Scope too large for current phase | Future phase |

### Dependency Upgrade Notes
| Package | Current | Latest | Upgrade? | Risk |
|---------|---------|--------|----------|------|
| `@google/genai` | 1.49.0 | 2.4.0 | ⚠️ **Defer** | v2 may change SDK interface for Gemini |
| `express` | 4.22.1 | 5.2.1 | ❌ **Defer** | Express 5 has breaking middleware changes |
| `lucide-react` | 0.546.0 | 1.16.0 | ❌ **Defer** | v1 may rename/remove icons |
| `vite` | 6.4.2 | 8.0.13 | ❌ **Defer** | Vite 8 removes deprecated APIs |
| `vitest` | 2.1.9 | 4.1.6 | ❌ **Defer** | Major config changes between major versions |
| `typescript` | 5.8.3 | 6.0.3 | ❌ **Defer** | TS6 removes legacy patterns |
| `tailwindcss` | 4.2.2 | 4.3.0 | ✅ **Safe** | Minor bump, no breaking changes |
| `zod` | 4.3.6 | 4.4.3 | ✅ **Safe** | Patch/minor, safe |

---

## [LOGGING STRATEGY]

**Principle**: Single winston logger instance in `server/lib/logger.ts`. No `console.*` in production paths.

```ts
// Approved — the only logger. All modules import this.
import { logger } from './server/lib/logger.js';
logger.info('...');
logger.warn('...');
logger.error('...');
```

**Enforcement**:
- `eslint.config.js` will add `no-console` rule for server files (warning, fixable)
- CI gate: `grep -r "console\." server/ --include="*.ts"` must return 0
- All `console.error` in `server/routes/ingest.ts` → replaced with `logger.error`

**Performance**: Winston Console transport is synchronous in practice but acceptable for request-volume (~10 RPS). For higher throughput add a file/network transport — no code change needed.

---

## [VERIFIABLE GATES]

```
Gate 0 (Initial state):  npm run typecheck = FAIL (8 errors)

Gate 1 (Week 1): ✅      npm run typecheck = PASS (0 errors)
                        npm run lint --quiet = PASS (0 errors)
                        npm run build = PASS
                        npm run dev = boots on :3000
                        **Status**: COMPLETED 2026-05-18

Gate 2 (Week 2): ✅      npm run typecheck = PASS
                        npm run build = PASS
                        Migration script at scripts/migrate-tenders.ts
                        **Status**: COMPLETED 2026-05-18

Gate 3 (Week 3): ✅      npm run typecheck = PASS
                        npm run build = PASS
                        npm run test = PASS (no tests yet — Milestone 4)
                        **Status**: COMPLETED 2026-05-18

Gate 4 (Week 4): ✅      npm run typecheck = PASS (0 errors)
                        npm run lint --quiet = PASS (0 errors, 8 warnings)
                        npm run build = PASS
                        npm run test = PASS (26 tests, 4 files)
                        Dockerfile = multi-stage, node:22-alpine, non-root
                        .dockerignore = present
                        .github/workflows/ci.yml = present
                        npm audit = 24 vulns (1 critical protobufjs — no upstream fix)
                        API tests = SKIPPED (esbuild + Node 24 TextEncoder bug)
                        **Status**: COMPLETED 2026-05-18
```
