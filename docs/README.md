# Documentation Index

> OsaroTechStore — Last updated: 2026-06-10

## Quick Navigation

| Document                                                        | Purpose                                               |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| [Functional Requirements](./functional-requirements.md)         | What the system does — features by module             |
| [Non-Functional Requirements](./non-functional-requirements.md) | Availability, performance, security, operations       |
| [Configuration Reference](./configuration.md)                   | All environment variables, defaults, and descriptions |

### Architecture

| Document                                                                         | Purpose                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Backend System Design Choices](./architecture/backend-system-design-choices.md) | Architecture decisions with implementation status and rationale          |
| [Backend Dependency Graph](./architecture/backend-dependency-graph.md)           | Startup wiring, module shape, event workflows, HTTP surface              |
| [Data Model](./architecture/data-model.md)                                       | ERD, collection indexes, schema validation, embed vs reference decisions |

### Architecture Decision Records

| #   | Title                                                                                  | Date       |
| --- | -------------------------------------------------------------------------------------- | ---------- |
| 001 | [Layered Hexagonal with Event-Driven Collaboration](./adr/001-architecture-pattern.md) | 2026-06-07 |
| 002 | [Custom Database Migration Runner](./adr/002-migration-runner.md)                      | 2026-06-07 |
| 003 | [CQRS Port-Level Separation — Payments Module Only](./adr/003-cqrs-scope.md)           | 2026-06-07 |
| 004 | [Manual Dependency Injection vs DI Container](./adr/004-manual-di.md)                  | 2026-06-10 |
| 005 | [Database Provider Abstraction](./adr/005-database-abstraction.md)                     | 2026-06-10 |
| 006 | [Dual Validation Strategy (Zod + $jsonSchema)](./adr/006-validation-strategy.md)       | 2026-06-10 |

## Documentation Conventions

- **Status labels:** Each ADR includes a status (Accepted, Proposed, Deprecated, Superseded).
- **Cross-references:** Docs link to each other using relative paths. `[ADR-004](../adr/004-manual-di.md)`.
- **Revision tracking:** Major docs include a "Revision History" table. ADRs are immutable after acceptance — new context goes in a new ADR.

## Related Files Outside docs/

| File                                                             | Purpose                                    |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `backend/docs/openapi.yaml`                                      | OpenAPI 3.0.3 specification for all routes |
| `backend/src/shared/infrastructure/http/middleware/schemas/*.ts` | Zod request validation schemas             |
| `backend/migrations/*.js`                                        | Database migration files                   |
| `backend/src/infrastructure/config/env.js`                       | Authoritative config loader                |
| `docker-compose.yml`                                             | Production-like deployment topology        |
| `.github/workflows/`                                             | CI/CD pipeline definitions                 |
