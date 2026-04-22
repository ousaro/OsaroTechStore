# Backend Gap Analysis Against Modular DDD + Hexagonal

## Scope

This document compares the current backend in `backend/src` with a real Modular DDD + Hexagonal target.

The review is based on the codebase as it exists on `2026-04-22`.

## Executive Summary

The backend has already made real progress:

- modules are organized by business area
- most modules contain `domain`, `application`, `ports`, and `infrastructure`
- module-local controllers and repositories are in place
- several direct infrastructure leaks were removed
- `composition.js` and `public-api.js` now exist as emerging module-surface conventions

But the backend is still **mid-migration**, not finished.

The current architecture is best described as:

> a modularized monolith with hexagonal structure in place, but still missing the domain depth, boundary tightness, and cross-module collaboration model expected from real Modular DDD + Hexagonal design.

## Current Maturity

| Area | Status | Notes |
| --- | --- | --- |
| Module split | Good | Clear business modules exist |
| Intra-module layering | Partial | Present in most modules, but uneven |
| Public module APIs | Partial | Only real cross-module surfaces remain, but some active contracts are still persistence-shaped |
| Domain purity | Partial | Major `ApiError`/validation leaks were removed, but rich domain modeling is still thin |
| Domain modeling | Weak | Mostly object factories and patch builders |
| Application orchestration | Partial | Use cases exist, but workflows are mostly CRUD-oriented |
| Cross-module communication | Partial | In-process events, handlers, and the first workflow now exist, but coverage is still narrow |
| Data ownership | Partial | Better than before, but still blurry around auth/users |
| Ports/contracts | Partial | Ports exist, but are shape assertions more than robust contracts |
| Testing strategy | Partial | Good unit baseline plus contract, event-handler, and first workflow coverage, but still not broad enough |

## What Is Already Working Well

### Module-based structure is real

The backend is no longer organized as one flat controller/service/repository stack. The move to:

- `auth`
- `users`
- `products`
- `categories`
- `orders`
- `payments`

is a legitimate architectural improvement.

### HTTP adapters are mostly module-local

Routes and controllers live inside their own business modules instead of a global transport layer. That aligns well with a bounded-context-first structure.

### Some domain logic has already been pulled out of persistence and controllers

Examples:

- order creation and update shaping
- product creation/update pricing rules
- auth registration/login validation moved out of Mongoose statics

This is an important step toward cleaner application orchestration.

### The module surface pattern now exists

The project now has:

- `composition.js` for private wiring
- `public-api.js` only where explicit cross-module access is needed
- `bootstrap.js` where a module has runtime startup concerns

That is materially better than letting every module expose everything through one broad entrypoint.

## What Is Missing

### 1. Real module autonomy

Modules exist, but not all of them are fully autonomous bounded contexts yet.

The clearest example is `payments`:

- it has a Stripe adapter
- it has payment use cases
- it does not yet have a real payment domain
- webhook processing does not update business state

Right now `payments` behaves more like an infrastructure integration packaged as a module than a true business hexagon.

The architectural direction is now explicit:

- `payments` should gain its own persistence model once webhook state, idempotency, and order collaboration are implemented

The remaining gap is implementation, not uncertainty about direction.

### 2. Rich domain building blocks

The backend still lacks most of the classic DDD components that make modular boundaries meaningful:

- aggregates
- value objects
- domain services
- domain events
- explicit state transitions

Most current “entities” are frozen objects with `toPrimitives()` and validation.

That said, the aggregate candidates are now clearer than before:

- `orders` is the strongest candidate for a real aggregate root
- `products` is a secondary candidate if stock/catalog rules deepen
- `payments` should only become an aggregate once payment state is persisted and lifecycle-driven

### 3. Event-driven collaboration

Cross-module collaboration is no longer purely synchronous and imperative.

Current state:

- `CategoryDeleted`, `OrderPlaced`, and `PaymentConfirmed` now exist
- the modular monolith now has an in-process event bus
- category deletion already has a tested cross-module event flow into product cleanup

What is still missing:

- broader event-handler coverage beyond the first workflow
- more than one cross-module workflow using the bus
- payment-to-order event handling with stable correlation

The direction is now explicit for the payments/orders seam:

- payments should publish payment outcome events
- orders should react and update order state inside the orders module

The remaining gap is implementation: event bus wiring, handlers, and stable payment-to-order correlation.

### 4. Anti-corruption layers

Translation layers are improving, but they are still selective rather than systematic.

This matters in two places:

- module-to-module collaboration
- gateway/persistence translation

What now exists:

- Stripe payload translation into provider-neutral payment state changes
- category/product collaboration translation through a dedicated translator
- explicit record mappers instead of the older misleading entity-style naming

What is still missing:

- broader use of ACL-style translation where module language diverges more deeply

### 5. Contract-focused testing

The project has a useful unit-test baseline, but it does not yet test the architecture as architecture.

Still-thin test areas:

- more cross-module workflow coverage beyond category/product cleanup
- more event-handler coverage as new event flows land

What already exists:

- module public API contract tests for `auth` and `products`
- adapter contract coverage for repositories and the Stripe gateway
- event-bus tests
- event-handler tests
- the first cross-module workflow test

## What Is Not Well Done Yet

### 1. Public APIs are still too broad

The broadest cross-module leaks were removed, but the remaining active surfaces are not perfect yet:

- auth still exposes repository-flavored account access methods
- some cross-module capabilities are still closer to persistence operations than business-language contracts

This weakens bounded-context isolation.

Target rule:

- other modules should consume only narrow, capability-specific contracts

### 2. Domain purity is incomplete

Current problems:

- rich domain modeling is still thin even though HTTP-shaped errors were removed
- some validation and policy concepts still need better value-object treatment
- transport mapping is cleaner, but domain/application boundaries are still not fully expressive

Why this matters:

- transport concerns leak into core business code
- domain logic becomes harder to reuse and test in a framework-agnostic way

### 3. Repositories still return raw records too often

Some mapper boundaries are now explicit, but the persistence boundary is still uneven across modules.

Effect:

- repository boundaries are weak
- persistence shape leaks inward
- the code only looks layered without enforcing meaningful model separation

### 4. Domain modeling is still patch-oriented

Orders, products, users, and categories are still primarily modeled as:

- create object
- validate fields
- create update patch
- persist

That is cleaner than raw controller logic, but it is still not rich DDD modeling.

### 5. Auth and users are still awkwardly split

The boundary is improved compared with direct shared model access, but it is still not clean enough.

Current issue:

- `users` depends on auth-backed account access through repository-shaped methods

The ownership decision is now explicit:

- keep `auth` and `users` as separate bounded contexts
- let `auth` own credential-bearing account identity data
- let `users` own profile-facing and admin-facing application behavior over those accounts

The remaining gap is not the decision itself anymore. The remaining gap is that the cross-module contract is still too repository-shaped for that decision to feel fully modeled.

### 6. Shared kernel discipline is better, but still needs guarding

Today:

- `shared/` is small and mostly generic
- business rules now live in modules instead of shared helpers
- the shared kernel currently holds generic errors, HTTP plumbing, Mongo bootstrap, and the in-process event bus

Remaining risk:

- future convenience helpers could drift business rules back into `shared/`
- generic validation helpers should stay transport-only unless a truly cross-module domain primitive emerges

### 7. Composition is better, but not yet strict

Today:

- route modules still import handlers through module `composition.js`
- `server.js` now starts the product scheduler through `products/bootstrap.js`

This is much better than before, but it is still not a fully disciplined composition-root model.

## Module-by-Module Gap View

### Auth

Good:

- use-case driven auth flows
- JWT port/service abstraction
- separated OAuth adapter

Gaps:

- account access contract is still persistence-shaped

### Users

Good:

- use cases exist
- repository is isolated from HTTP

Gaps:

- very thin domain model
- boundary with auth is still weakly defined
- no explicit profile aggregate or user-specific value objects

### Products

Good:

- product rules are not in controllers
- scheduler ownership is better placed

Gaps:

- mapper layer is still weak
- no richer stock/catalog aggregate behavior yet, but the current rules still do not justify a heavier aggregate root

### Categories

Good:

- category rules are local
- product cleanup no longer reaches into product infrastructure directly

Gaps:

- synchronous coupling remains
- no event-based deletion flow
- category entity naming/modeling is still misleading

### Orders

Good:

- order creation/update logic exists in domain code
- repository persists shaped data

Gaps:

- no value objects for address/status/payment state
- no aggregate behavior for order lifecycle
- no meaningful order/payment collaboration model

### Payments

Good:

- Stripe is isolated behind a port
- webhook auth handling is correct

Gaps:

- no payment domain
- no payment state persistence
- no order sync or event publication
- module is still integration-first, not domain-first

### Orders/Payments Boundary

Good:

- the direction is now explicit: orders should keep fulfillment-relevant payment state, while payments should own provider-specific payment lifecycle data

Gaps:

- `orders` still stores `transactionId` and `paymentDetails` directly
- the boundary has been decided, but the field migration has not happened yet

## Highest-Priority Work

### Priority 1

- turn `payments` into a real business module
- narrow the remaining active cross-module contracts
- deepen domain modeling beyond validation and patch builders
- strengthen mapper boundaries so repositories stop returning raw records

### Priority 2

- define the auth/users bounded-context relationship clearly
- introduce key value objects in orders, auth, and payments
- add contract tests for ports and public APIs

### Priority 3

- add domain/application events
- introduce ACLs for cross-module collaboration
- separate commands, queries, and DTOs where workflow complexity justifies it

## Final Assessment

The project is on the right path.

What is already true:

- it is not a random layered monolith anymore
- module boundaries are visible
- several important refactors have already landed

What is not true yet:

- modules are not all autonomous hexagons
- domain boundaries are not yet strict
- cross-module collaboration is not yet designed for long-term scalability

If the current direction continues with tighter APIs, purer domain code, stronger mapping, and event-driven workflows, this backend can grow into a real Modular DDD + Hexagonal architecture without a rewrite.
