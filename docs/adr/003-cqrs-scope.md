# ADR 003: CQRS Port-Level Separation — Payments Module Only

**Status:** Accepted  
**Date:** 2026-06-07  
**Deciders:** Project lead

---

## Context

CQRS (Command Query Responsibility Segregation) separates read and write operations into different models. This is a valuable pattern for complex domains but adds overhead. The project needed to:

1. Demonstrate CQRS
2. Keep implementation effort proportional to the value gained
3. Show the pattern without over-engineering the entire codebase

## Decision

Apply **CQRS port-level separation only to the payments module**, as a demonstration:

- `paymentsCommandsPort.js` — commands (create payment intent, process webhook)
- `paymentsQueriesPort.js` — queries (get payment by order)

The controller (`paymentsController.js`) injects both ports separately, making the read/write split explicit at the HTTP boundary.

Other modules (auth, users, products, categories, orders) remain with a single combined port.

> **Note:** All modules independently organise their application use-cases into `commands/` and `queries/` folders, providing a lighter CQRS-style separation at the use-case layer even without port-level splitting.

## Consequences

**Positive:**

- Clear demonstration of port-level CQRS pattern without full codebase migration
- Payments module has natural read/write asymmetry (writes: Stripe intents, reads: payment history)
- Provides a template for migrating other modules to port-level CQRS in the future

**Negative:**

- Inconsistency: some modules have port-level CQRS, others don't (documented design choice)
- Added boilerplate for a single module (ports, controller changes, wiring)

**Future:**

- If the codebase grows, port-level CQRS can be extended to orders module (order creation vs order status queries) and products module (admin writes vs customer reads) — these modules already have use-case-level `commands/`/`queries/` separation; only the port interface needs splitting
