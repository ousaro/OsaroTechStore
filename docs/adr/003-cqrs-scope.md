# ADR 003: CQRS Demonstration — Payments Module Only

**Status:** Accepted  
**Date:** 2026-06-07  
**Deciders:** Project lead

---

## Context

CQRS (Command Query Responsibility Segregation) separates read and write operations into different models. This is a valuable pattern for complex domains but adds overhead. The project needed to:

1. Demonstrate CQRS as a CV-worthy architectural pattern
2. Keep implementation effort proportional to the value gained
3. Show the pattern without over-engineering the entire codebase

## Decision

Apply **CQRS boundaries only to the payments module**, as a demonstration:

- `paymentsCommandsPort.js` — commands (create payment intent, process webhook)
- `paymentsQueriesPort.js` — queries (get payment by order)

The controller (`paymentsController.js`) injects both ports separately, making the read/write split explicit at the HTTP boundary.

Other modules (auth, users, products, categories, orders) remain with a single combined port.

## Consequences

**Positive:**

- Clear demonstration of CQRS pattern without full codebase migration
- Payments module has natural read/write asymmetry (writes: Stripe intents, reads: payment history)
- Provides a template for migrating other modules to CQRS in the future

**Negative:**

- Inconsistency: some modules have CQRS, others don't (documented design choice)
- Added boilerplate for a single module (ports, controller changes, wiring)

**Future:**

- If the codebase grows, CQRS can be extended to orders module (order creation vs order status queries) and products module (admin writes vs customer reads)
