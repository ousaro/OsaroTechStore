# Backend Architecture (DDD + Hexagonal)

## Layers
- Domain: entities, value objects, domain services, domain errors.
- Application: use-cases (orchestrate domain logic).
- Infrastructure: adapters (HTTP, DB, Stripe, OAuth, etc).

## Folder Contract
- `modules/<bounded-context>/domain/*`
- `modules/<bounded-context>/application/*`
- `modules/<bounded-context>/infrastructure/*`

## Dependency Rule
- Domain depends on nothing.
- Application depends on domain ports/interfaces.
- Infrastructure implements ports.

## Current Stage
- Foundation + app bootstrap created.
- Auth context reconstructed (JWT + OAuth adapters).
- Users context reconstructed (legacy behavior preserved).
- Catalog context reconstructed (products + categories, including write-side).
- Orders context reconstructed (legacy placeholder read-by-id preserved).
- Payments context reconstructed (Stripe gateway adapter).
- Cross-cutting hardening added (shared ApiError, validation helpers, targeted tests).
- Existing legacy routes still active.
- Context-by-context reconstruction follows in next commits.
