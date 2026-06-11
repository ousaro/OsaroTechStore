# ADR 005: Database Provider Abstraction

**Status:** Accepted  
**Date:** 2026-06-10  
**Deciders:** Project lead

---

## Context

The backend needs database connectivity. Requirements:

1. Must support at least MongoDB (primary target for rapid prototyping and document-oriented product/category/order data)
2. Should allow switching to PostgreSQL without changing module business logic

Options:

1. **Single database (MongoDB only)** — simplest, no abstraction overhead
2. **Provider abstraction** — resolver/strategy pattern selecting between `mongo` and `postgres` at startup
3. **Repository pattern only** — abstract behind repository ports but hard-code MongoDB implementation

## Decision

Adopt a **provider abstraction** via `resolveDatabaseStrategy.js`:

- Strategy interface: `{ connect(), disconnect(), isConnected(), client, db }`
- Currently one implementation: `mongoProvider.js` (Mongoose)
- PostgreSQL provider exists as a stub/target but is not implemented
- Selection via `DATABASE_PROVIDER` env var (`mongo` or `postgres`)

Repository implementations (e.g., `mongooseUserRepository.js`) remain specific to the database chosen. The abstraction ensures module use cases never touch the database driver directly — they only depend on repository ports.

## Why Not Single-Database Only

| Factor               | Single DB              | Provider Abstraction                          |
| -------------------- | ---------------------- | --------------------------------------------- |
| Implementation speed | Fastest                | Slightly slower (strategy file + assertion)   |
| Future-proofing      | Full rewrite to switch | Add a new provider module                     |
| Testing              | Mock Mongoose directly | Swap to `postgres` provider + test both paths |
| Runtime flexibility  | Locked to one DB       | Change `DATABASE_PROVIDER` env var            |

The abstraction cost is a single `resolveDatabaseStrategy.js` (~30 lines) plus `assertDatabasePort.ts` (~15 lines). The flexibility benefits far outweigh this cost.

## Consequences

**Positive:**

- Module code never imports `mongoose` or any database driver — repository ports are pure JS interfaces
- Adding PostgreSQL requires only: new provider file, new repository implementations, update the resolver map
- CI can run a test matrix against both providers if stubs are implemented
- Clear demonstration of the strategy pattern in a real production context

**Negative:**

- Repository implementations are duplicated per provider (Mongoose vs raw SQL) — 2× repository code if second provider is built
- Some Mongo-specific features (embedded documents, `$jsonSchema` validators) have no Postgres equivalent — feature parity requires schema redesign
- The `dbClient` object returned by the provider has different shapes per implementation (Mongoose instance vs `pg.Pool`) — consumers must handle both

**Risks:**

- Postgres implementation, if built, will require different migration tooling and schema design (SQL DDL vs Mongo migration scripts)

## Related

- [ADR-001: Architecture Pattern](./001-architecture-pattern.md) — provider abstraction aligns with hexagonal ports/adapters
- [Backend System Design Choices](../architecture/backend-system-design-choices.md) — Provider Selection section
