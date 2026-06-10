# ADR 006: Dual Validation Strategy — Zod + MongoDB $jsonSchema

**Status:** Accepted  
**Date:** 2026-06-10  
**Deciders:** Project lead

---

## Context

Request data must be validated before entering business logic. Database data must be validated at rest. Options considered for each layer:

### HTTP Request Validation

1. **Zod** — TypeScript-first schema validation with type inference
2. **Joi** — Mature, rich validation language
3. **Yup** — Similar to Joi, popular in React ecosystems
4. **express-validator** — Middleware-based, string-heavy
5. **TypeScript only** — Compile-time checks only, no runtime

### Database Schema Validation

1. **MongoDB $jsonSchema** — Native schema validation at the DB level
2. **Mongoose schema** — Application-level, bypassed by raw `mongodb` driver
3. **No DB validation** — Trust application layer exclusively

## Decision

Use **Zod for HTTP-boundary validation** and **MongoDB `$jsonSchema` validators for database-level enforcement**.

```
HTTP Request → Zod validateRequest middleware → Use Case → Repository → MongoDB ($jsonSchema)
```

### Zod

- Schemas defined in `shared/infrastructure/http/middleware/schemas/*.ts`
- `validateRequest.ts` middleware validates `body`, `query`, `params` against schemas
- Returns `400` with field-level error details on failure
- TypeScript types inferred via `z.infer<typeof schema>` — no manual DTO types

### MongoDB $jsonSchema

- Defined in `migrations/001-create-initial-schema.js` using `collMod` / `createCollection` with `validator: { $jsonSchema: { ... } }`
- Enforced at the database level for all 5 collections: users, categories, products, orders, payments
- Catches invalid writes from any client (direct `mongosh`, legacy scripts, buggy code)

## Why Zod

| Factor               | Zod                                | Joi                 | Yup                 |
| -------------------- | ---------------------------------- | ------------------- | ------------------- |
| TypeScript inference | `z.infer` — first-class            | Manual interfaces   | Manual interfaces   |
| Bundle size          | ~15 KB gzipped                     | ~50 KB              | ~25 KB              |
| Express integration  | Custom middleware (30 lines)       | `celebrate` wrapper | Custom middleware   |
| Error format         | Standardized `ZodError`            | Joi-specific format | Yup-specific format |
| Schema composition   | `.merge()`, `.extend()`, `.pick()` | `.concat()`         | Mixed API           |

Zod's TypeScript-native design aligns with the shared TypeScript kernel in `src/shared/`. No manual type maintenance between schema and DTO.

## Why MongoDB $jsonSchema

Without DB-level validation, a bug in application code or a direct database write could insert malformed data. `$jsonSchema` provides:

- **Defense in depth** — a second validation layer that cannot be bypassed by application bugs
- **Self-documenting** — the schema definition in the migration serves as the canonical data contract
- **Consistency** — all clients (app, scripts, direct queries) must respect the same rules

## Consequences

**Positive:**

- No type duplication — Zod schemas are the single source of truth for request shapes
- DB-level validation catches data corruption that would otherwise go undetected
- Migration `001` serves as executable documentation of the database schema contract
- Zod's `.partial()` enables trivial update-schema derivation from create-schema

**Negative:**

- Schema mismatch risk: Zod and `$jsonSchema` are maintained separately — they can drift apart (mitigation: integration tests that send valid Zod output to the DB and verify `$jsonSchema` accepts it)
- MongoDB `$jsonSchema` error messages are cryptic (`Document failed validation`) compared to Zod's field-level messages
- `$jsonSchema` cannot express cross-field constraints (e.g., `endDate > startDate`) — those must be in application logic

**Risks:**

- Zod version upgrades may break type inference patterns (currently pinned to v4.x)
- MongoDB `$jsonSchema` has limited expressiveness for array validations and conditional requirements compared to Zod

## Related

- Database schema migration: `backend/migrations/001-create-initial-schema.js`
- Zod schemas: `backend/src/shared/infrastructure/http/middleware/schemas/*.ts`
- Validation middleware: `backend/src/shared/infrastructure/http/middleware/validateRequest.ts`
