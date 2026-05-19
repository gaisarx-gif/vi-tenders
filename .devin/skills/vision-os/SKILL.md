---
name: vision-os
description: Project-specific knowledge for Vision-OS — domain glossary, Firestore schema, AI pipeline architecture, status enums, and naming conventions. Invoke whenever working in this repository.
when_to_use: Always at session start when working on Vision-OS / Vision Tenders Platform. Especially when touching anything in `server/`, `src/lib/normalizer.ts`, `src/types.ts`, `firestore.rules`, or PDF/Excel ingestion.
---

# Vision-OS — project skill

## Domain glossary

| Term                    | Meaning                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Tender** (مناقصة)     | A government procurement announcement (build a road, supply IT, run a clinic, etc.).                                       |
| **Practice** (ممارسة)   | A direct-negotiation procurement (smaller scope). Treated as a tender for our purposes.                                    |
| **Issue** (عدد)         | One published edition of the **Kuwait Today** (الكويت اليوم) gazette. Has an `issueNumber` (e.g. `1650`) and `date`.       |
| **Tender Issue**        | A grouping document in Firestore that holds an array of tenders extracted from one issue's PDF.                            |
| **Manual Issue**        | Special doc id `manual-issue` — bucket where manually-entered tenders live (since they don't belong to a real gazette).    |
| **Organization** (جهة)  | A government entity that publishes tenders. We canonicalize their names (variants → one form). See `KNOWN_ORG_MAP`.        |
| **Canonical org id**    | A slugified lowercase version of the canonical Arabic name, used to merge duplicate orgs.                                  |
| **Watchlist**           | Per-user subscription to a tender or organization → user gets notifications on changes.                                    |
| **Subscription**        | Firestore record that backs the watchlist. `{ userId, targetId, type: 'tender'                                             | 'organization' }`. |
| **Calendar event**      | User-defined date for follow-up / pre-tender meeting. Per-user via `userId = canonicalUid`.                                |
| **Authorized employee** | Pre-approved login by employee ID code. Stored in `authorized_employees` collection (doc id = uppercased ID/email).        |
| **Owner**               | Super-admin email defined by `OWNER_EMAIL` env var (default `aawad39506@gmail.com`). Always admin, even without DB record. |

## Tender status enum

There are **exactly 4 statuses**. Always normalize input to one of these.

| Internal value    | Arabic label | English label   |
| ----------------- | ------------ | --------------- |
| `New Tender`      | طرح جديد     | New Tender      |
| `Postponed`       | تأجيل        | Postponed       |
| `Re-announcement` | إعادة طرح    | Re-announcement |
| `Advance Notice`  | تنويه        | Advance Notice  |

Never hardcode status strings — import from `src/lib/normalizer.ts` (`TenderStatus` type) or use the `STATUS_TO_AR` map in the pipeline.

## Data sources

`DataSource = 'PDF_ANALYSIS' | 'EXCEL_IMPORT' | 'MANUAL_ENTRY'`

Every tender carries a `dataSource` so we know how it got into the system.

## Firestore schema

Documented in `firebase-blueprint.json`. Key collections:

```
/users/{userId}                       — User profile (uid, email, role)
/authorized_employees/{ID}            — { employeeId, role, createdAt } (id is uppercased email or employee code)
/issues/{issueId}                     — TenderIssue { issueNumber, date, tenders[] (embedded), createdAt }
/tenders/{tenderId}                   — UNUSED currently (tenders embedded in issues — see below)
/subscriptions/{subId}                — { userId, targetId, type, createdAt }
/notifications/{noteId}               — { userId, title, message, type, tenderId?, eventId?, read, createdAt }
/calendar_events/{eventId}            — { userId, date, purpose, tenderNo?, organizationName?, description, createdAt }
/companies/{companyId}                — Company directory entry
/canonical_organizations/{orgId}      — Canonical org info (referenced by tenders[].canonicalOrgId; cleanup target on merge)
```

⚠ Tenders are **embedded inside issues** (`issue.tenders[]`), not a separate collection. This makes some queries awkward — e.g. `update-tender-status` has to scan all issues to find the tender. Document this if changing the model.

## Server architecture (current)

```
server.ts                       1010 lines — to be split (see backlog)
├── auth: /api/login (employee ID OR Firebase ID token)
├── auth: /api/me (re-checks role from Firestore, refreshes JWT)
├── auth: /api/logout
├── admin: /api/admin/employees (CRUD)
├── admin: /api/admin/issues (POST + DELETE)
├── admin: /api/admin/update-tender-status (also fans out notifications)
├── admin: /api/admin/merge-organizations (batch update + cleanup)
├── user: /api/subscriptions (CRUD)
├── user: /api/notifications (list + mark-read)
├── user: /api/calendar-events (CRUD)
├── user: /api/companies (CRUD; write currently any-auth — to tighten)
├── user: /api/tenders (manual create + patch)
└── ingest: /api/ingest/{pdf,excel,manual} + /api/tenders/summarize  (mounted from server/routes/ingest.ts)
```

## AI pipeline architecture

```
[PDF / Excel / Manual]
        │
        ▼
   parsers/<source>.ts          parsers know the input format
        │  (RawExtraction[])
        ▼
   normalizer.ts                status + org name canonicalization
        │  (NormalizedTender[])
        ▼
   validator.ts                 reports per-row warnings/errors; drops blocking errors
        │  (NormalizedTender[]) + errors[]
        ▼
   enricher.ts                  adds id, createdAt, dataSource, canonicalOrgId, statusAr
        │
        ▼
   EnrichedTender[]             returned to the client/router
```

Key invariant: **the pipeline never imports a concrete AI model.** AI access is through `AIProvider` (`server/ai/provider.ts`). The current implementation is `GeminiProvider` (`server/ai/providers/gemini.ts`); add new providers there.

## File-by-file landmarks

| File                                                        | Why it matters                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/App.tsx`                                               | Auth state machine + Firestore `issues` listener + redirect handling.                                  |
| `src/components/Dashboard.tsx`                              | Mega-component (1055 lines). All tabs render here. **Add new tabs as separate files in `src/views/`.** |
| `src/components/TenderDetails.tsx`                          | Currently **NOT rendered** anywhere — Phase-3 backlog.                                                 |
| `server/ai/prompts.ts`                                      | The `PDF_EXTRACTION_PROMPT` is highly tuned for Kuwait Today. Edit carefully.                          |
| `server/pipeline/normalizer.ts` AND `src/lib/normalizer.ts` | Byte-identical duplicates. Phase-3 backlog: dedup.                                                     |
| `firestore.rules`                                           | Don't edit without explicit user approval — security regression risk.                                  |
| `scripts/migrate-uids.ts`                                   | One-off, idempotent, supports `--dry-run`. Migrates legacy email-based `userId`s to canonical UIDs.    |

## Common gotchas

1. **PDF extraction**: chunks of 15 pages each are sent to Gemini in series (loop in `server/pipeline/parsers/pdf.ts`). With ~150-page gazettes, that's 10 sequential calls. Consider parallelizing in future, but watch the 15 RPM rate limit.
2. **`activeTab` is a string**, not a route. Lots of code derives behavior from the string. Adding `@tanstack/router` (Phase 4) will need a migration table.
3. **Notifications get fan-out written by the server**, not by clients. Firestore rules block client writes to `notifications` (rightly).
4. **`/api/admin/issues` POST** is also called for confirmed-PDF and Excel imports — its Zod schema (`IssueCreateSchema`) must accept tenders from all three flows.
5. **`firebase-applet-config.json`** is being removed in Phase 2 in favor of env vars. After that, do NOT reintroduce it.

## When extending the pipeline

- New source format → add `server/pipeline/parsers/<format>.ts` returning `RawExtraction[]`.
- New AI provider → add `server/ai/providers/<name>.ts`, register in `server/ai/index.ts`, document `<NAME>_API_KEY` in `.env.example`.
- New status → update `TenderStatus` type, `STATUS_TO_AR` map (twice currently — pipeline + enricher), `firestore.rules` enum, `firebase-blueprint.json`, all UI badge color maps.

## When in doubt

Check `AGENTS.md` for project-wide rules. Check `PROGRESS.md` for what's already done and what's deferred.
