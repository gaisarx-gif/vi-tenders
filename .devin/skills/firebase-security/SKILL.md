---
name: firebase-security
description: Patterns and pitfalls for writing Firebase Auth + Firestore security rules in this codebase. Covers role checks, owner identification, custom token flow, and rule debugging.
when_to_use: When editing `firestore.rules`, the `/api/login` and `/api/me` endpoints, the `getCanonicalUid` helper, or any `request.auth` related logic.
---

# Firebase Security — patterns for Vision-OS

## Authentication flow at a glance

```
Browser  ──Google sign-in──▶  Firebase Auth (popup/redirect)
   │                                │
   │  ID token (idToken)            │  Firebase Auth UID, email, etc.
   ▼                                │
POST /api/login   ◀──────────────────┘
   │
   │  server: admin.auth().verifyIdToken(idToken) → { uid, email, ... }
   │  server: admin.auth().createCustomToken(canonicalUid)  → firebaseToken
   │  server: jwt.sign({ employeeId, canonicalUid, role }) → auth_token cookie
   ▼
Browser receives:  { employeeId, role, firebaseToken }
   │
   │  client: signInWithCustomToken(auth, firebaseToken)
   ▼
Browser is now Firebase-authenticated as canonicalUid
```

For employee-ID logins (no Google), there's no Firebase ID token, but the server still issues:

- a JWT cookie (for our own API)
- a Firebase **custom token** for `canonicalUid = emp_<sha256(employeeId)>` so Firestore client SDK reads work

## Rule-writing principles (specific to this app)

### 1. Never trust `request.resource.data.role`

A user could try to write `{ role: 'admin' }` to their own `/users/{uid}` document. Our rule explicitly blocks role escalation:

```firestore
match /users/{userId} {
  allow write: if isAdmin()
            || (isAuthenticated() && request.auth.uid == userId
                && request.resource.data.role == 'user');
}
```

### 2. Owner is identified by **email**, not UID

Because Google OAuth UIDs change if the project is migrated, the owner is keyed by email:

```firestore
function isOwnerEmail() {
  return isAuthenticated()
      && request.auth.token.email == "aawad39506@gmail.com";  // hardcoded — see below
}
```

**Limitation**: rules don't have access to env vars. The owner email is hardcoded in `firestore.rules`. We mitigate by:

- Documenting it as a constant at the top of the rules file.
- Mirroring the same value in `process.env.OWNER_EMAIL` for the server.
- Optionally, reading the owner email from a Firestore config doc:
  ```firestore
  function ownerEmail() {
    return get(/databases/$(database)/documents/app_config/owner).data.email;
  }
  function isOwnerEmail() {
    return isAuthenticated() && request.auth.token.email == ownerEmail();
  }
  ```
  (Costs an extra read per rule evaluation — fine on Spark plan but watch the budget.)

### 3. Server writes via Admin SDK bypass rules

Anything the Express server writes (issues, tenders, notifications) goes through `firebase-admin` which **ignores rules**. Therefore:

- Set client-side `allow write: if false` for `/issues/*`, `/tenders/*`, `/notifications/*`.
- Validate inputs in the server with Zod **before** writing.
- Never expose the Admin SDK credentials to the browser.

### 4. Read-your-own-data pattern

Any per-user collection (`subscriptions`, `notifications`, `calendar_events`) uses:

```firestore
match /subscriptions/{subId} {
  allow read: if isAuthenticated()
           && (resource.data.userId == request.auth.uid || isAdmin());
  allow write: if isAuthenticated()
            && (request.resource.data.userId == request.auth.uid || isAdmin());
}
```

Both `resource.data.userId` (existing doc) and `request.resource.data.userId` (incoming write) must match `request.auth.uid`.

### 5. Updates to specific fields only

For "mark notification as read", restrict to a single field:

```firestore
allow update: if isAuthenticated()
           && resource.data.userId == request.auth.uid
           && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
```

## Common pitfalls

| Pitfall                                                                         | Symptom                                                 | Fix                                                                                                                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Querying a collection where rule doesn't allow `list`                           | Query returns 0 results, or `permission-denied`         | Add `allow list:` to the rule, or use Admin SDK on the server.                                                                                               |
| `request.auth` is null even though user is signed in client-side                | The client sent a request without the Firebase ID token | Use `httpsCallable` or pass token in `Authorization: Bearer <idToken>` and verify server-side.                                                               |
| `email.upper()` doesn't exist                                                   | Rule eval error                                         | Firestore CEL has `string.upper()` — but emails should be normalized to lowercase by the server BEFORE storing the document id. Use `.lower()` consistently. |
| Owner sometimes can't write because their `authorized_employees` doc is missing | `Access Denied: Unauthorized`                           | We have a fallback in `/api/login`: if email matches `OWNER_EMAIL`, treat as admin even if no DB record. Mirror this in rules.                               |
| `is admin` query reads from `authorized_employees` but key case mismatches      | Rule eval returns false for valid admin                 | Always uppercase the email/employeeId on **insert** so the key is canonical.                                                                                 |
| New collection added without rules                                              | Default-deny: client can't read/write                   | Add a `match /<collection>/{id}` block. Document in `firebase-blueprint.json`.                                                                               |
| Rule changes deployed to wrong project                                          | Production opens up unexpectedly                        | Always verify `firebase use` / `firebase projects:list` before `firebase deploy --only firestore:rules`.                                                     |

## How to test rules locally

The Firebase Emulator suite (free, runs locally) supports Firestore rules:

```bash
# (one-time) install the Firebase CLI globally
npm install -g firebase-tools

# Start emulators (Firestore + Auth)
firebase emulators:start --only firestore,auth

# Point your app at them by exporting:
#   export FIRESTORE_EMULATOR_HOST=localhost:8080
#   export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

Test cases worth keeping (Phase 7 backlog):

- ✅ admin can read & write all `authorized_employees`
- ✅ regular user can read but not write `authorized_employees` (other than their own status check)
- ✅ user can write their own subscription
- ✅ user **cannot** write someone else's subscription
- ✅ user can mark their own notification as read but not toggle other fields
- ✅ user **cannot** create a notification (server-only)
- ✅ owner email login still works even without an `authorized_employees` doc

## Custom-token gotchas

- `admin.auth().createCustomToken(uid, claims?)` accepts custom claims that show up in `request.auth.token`. We could put `role` here and skip the Firestore lookup in rules — but then we'd need to refresh the token whenever role changes. **Current choice**: don't use custom claims; do a `get()` from rules. Trade-off: more reads but simpler invalidation.
- Custom tokens expire after 1 hour. Our `/api/me` endpoint mints a fresh one on every call → the client should re-call `/api/me` periodically (or on focus) and pass the new `firebaseToken` to `signInWithCustomToken`.

## When changing the auth strategy

Anything that touches `getCanonicalUid` requires a migration:

- Existing Firestore docs already store the old `userId` value.
- Run `scripts/migrate-uids.ts --dry-run` first, inspect, then run for real.
- Communicate to users (notifications/calendar events that briefly disappear).
