# ADR 001: Architecture Pattern — Layered Hexagonal with Event-Driven Collaboration

**Status:** Accepted  
**Date:** 2026-06-07  
**Deciders:** Project lead (backend engineering showcase)

---

## Context

The backend needed an architecture that:

1. Enforces separation of concerns between domain logic, application logic, and infrastructure
2. Allows modules (auth, users, products, categories, orders, payments) to evolve independently
3. Supports event-driven cross-module communication without tight coupling
4. Is demonstrably testable — each layer can be tested in isolation
5. Serves as a strong CV showcase for backend engineering practices

## Decision

Adopt a **layered hexagonal (ports-and-adapters) architecture** with the following structure per module:

```
src/modules/{module}/
  domain/          — Entities, value objects, domain events, domain services
  application/     — Use cases, ports (input/output interfaces)
  infrastructure/  — HTTP routes, controllers, adapters (DB, external APIs)
```

Cross-cutting concerns use the same pattern in `src/shared/`:

```
src/shared/
  domain/          — Shared domain concepts (errors, events, value objects)
  application/     — Shared use-case concerns (pagination, ports)
  infrastructure/  — Middleware, persistence, logging, audit
```

Key principles:

- **Dependency rule:** Domain → nothing. Application → domain only. Infrastructure → anything.
- **Dependency injection** via a single composition root (`configureApplicationModules.js`)
- **Event-driven collaboration** between modules via an in-process or Redis event bus
- **Infrastructure abstraction** via resolver/strategy pattern (logger, database, payment, event bus)

## Consequences

**Positive:**

- Clear testing boundaries — architecture tests (`tests/unit/architecture/dependency-rules.test.js`) enforce layer isolation
- Easy to swap infrastructure (Pino vs console logger, Mongo vs Postgres, Stripe vs PayPal)
- Cross-module features (e.g., order → payment pipeline) are explicit event translators in `collaboration/` directories

**Negative:**

- More boilerplate per module (ports, adapters, composition wiring)
- Manual DI wiring scales linearly with module count — a DI container (awilix, inversify) would help at higher complexity

**Risks:**

- Teams may shortcut the pattern by adding business logic to controllers or routes (guarded by architecture tests)
