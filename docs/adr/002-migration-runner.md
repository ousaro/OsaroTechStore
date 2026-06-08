# ADR 002: Database Migration Runner — Custom (not migrate-mongo)

**Status:** Accepted  
**Date:** 2026-06-07  
**Deciders:** Project lead

---

## Context

The project needed a versioned, reversible database migration system. Options evaluated:

1. `migrate-mongo` — popular npm package
2. Custom runner using raw `mongodb` driver
3. Mongoose migrations (community packages)

Constraints:

- Backend uses ES modules (`"type": "module"` in package.json)
- Migrations must work with raw MongoDB driver (not Mongoose) for schema validation setup
- Simple up/down semantics with a tracking collection

## Decision

Build a **custom migration runner** (`migrations/runner.js`, `migrations/migrate.js`) using the raw `mongodb` driver directly.

Key design:

- Migration files: `YYYYMMDDHHMMSS-description.js` with named `up(db)` and `down(db)` exports
- Tracking collection: `_migrations` on the target database
- Support: `up` (all pending), `down [N]` (rollback N steps), `create <name>`
- Running via `npm run migrate`, `npm run migrate:down`, `npm run migrate:create`

## Why Not migrate-mongo

`migrate-mongo` had ESM/CommonJS compatibility issues when used in an ESM project alongside dynamic imports. The custom runner is ~70 lines and solves the exact problem without an extra dependency.

## Consequences

**Positive:**

- No dependency on a migration framework (fewer audit surface, no version conflicts)
- Full control over migration lifecycle and error handling
- Easy to add features (seed data injection, environment-aware migrations)

**Negative:**

- Must maintain the runner ourselves (minor — it's small and stable)
- No built-in CLI help or advanced features (stashing, merging)
