# Backend Architecture (Current State)

## Purpose

This document describes the backend as it exists today in `backend/src`, not the idealized end state.

The backend is already organized as a **modular monolith with hexagonal intent**:

- business code is split into modules under `modules/`
- most modules have `domain`, `application`, `ports`, and `infrastructure`
- HTTP adapters are module-local
- module wiring is mostly centered in `composition.js`
- cross-module access has started moving through `public-api.js`

It is a meaningful step away from a flat layered monolith, but it is **not yet a fully realized Modular DDD + Hexagonal architecture**.

## Current Module Layout

The backend currently has these business modules:

- `auth`
- `users`
- `products`
- `categories`
- `orders`
- `payments`

Typical module shape today:

```text
modules/<module>/
├── application/
│   ├── commands/ or queries/ (where workflow complexity justifies it)
│   ├── dto/ (only when the application boundary needs explicit response shapes)
│   └── errors/ / policies/ / validation/
├── domain/
├── infrastructure/
│   ├── http/
│   ├── persistence/ or repositories/ or gateways/
├── ports/
│   ├── input/
│   └── output/
├── composition.js
├── public-api.js (only when cross-module capabilities are needed)
└── bootstrap.js (only when a module has runtime startup concerns)
```

## What Each File Means Today

- `composition.js`
  - private module wiring
  - creates repositories, services, use cases, input ports, and HTTP handlers
- `public-api.js`
  - intended cross-module surface
  - now exists only in modules with real cross-module capabilities
- `bootstrap.js`
  - optional runtime startup surface for module-level concerns such as schedulers

## Layering Status

### Domain

What exists:

- domain constructor functions
- validation helpers
- some domain-shaped creation/update logic

What is still weak:

- domain objects are mostly thin frozen objects with `toPrimitives()`
- rich DDD building blocks are still uneven across modules
- aggregates, domain services, and domain events are still mostly absent

### Application

What exists:

- module-local application flows, with `orders`, `payments`, and `auth` now split into command/query folders
- use cases coordinate repositories and gateways
- several CRUD flows are cleaner than before

What is still weak:

- most use cases are still CRUD-oriented orchestration
- command/query/dto separation is now present in the highest-workflow modules, but is not needed everywhere yet
- cross-module workflows are mostly synchronous and request/response shaped

### Ports

What exists:

- input ports for all main modules
- output ports for repositories, token services, and payment gateway access

What is still weak:

- ports are mostly runtime assertion helpers
- some cross-module contracts are still persistence-shaped
- contract coverage exists for several important adapters, but it is not yet comprehensive

### Infrastructure

What exists:

- module-local HTTP routes and controllers
- module-local repositories and persistence models
- Stripe gateway adapter in `payments`
- auth JWT and OAuth adapters
- Mongo connection, shared HTTP middleware, shared error primitives, and a shared in-process event bus under `shared/`

What is still weak:

- some mapping layers are still thin even though the worst raw-record leaks were removed
- anti-corruption boundaries are clearer for Stripe and category/product collaboration, but are still not comprehensive
- bootstrap wiring is cleaner, but there is still no strict single composition root for all runtime concerns

## Module-by-Module Snapshot

### Auth

Current strengths:

- registration, login, and access-token verification are use-case driven
- JWT handling is behind a token service port
- OAuth adapter is separated into infrastructure

Current limitations:

- auth still exposes account-access methods that feel repository-shaped across the boundary
- password policy is still application-policy driven rather than modeled through richer auth-specific value objects

### Users

Current strengths:

- use cases exist for lookup, update, password update, and delete
- user repository is separated from HTTP concerns

Current limitations:

- the module depends on the auth module for data access
- the auth/users boundary is cleaner than direct model sharing, but still persistence-shaped
- user domain modeling is very thin

## Auth and Users Boundary Decision

The current codebase now makes one architectural decision explicit:

- `auth` and `users` remain separate bounded contexts
- `auth` owns account identity and credential data
- `users` owns profile-facing and admin-facing application behavior over those accounts

In concrete terms, `auth` is the source of truth for:

- account lookup by id
- credential-bearing account records
- login and registration rules
- token verification
- account persistence operations currently exposed through `auth/public-api.js`

`users` is responsible for:

- user-facing and admin-facing account management use cases
- profile-style reads and updates
- password-update orchestration from the consumer side
- shaping stable user records for the rest of the module

This means `users` is currently a behavioral facade over auth-owned account data, not a separate persistence owner.

That split is acceptable for the current codebase because:

- auth already owns the credential-bearing record
- users adds a different application-facing surface without reaching into auth infrastructure directly
- the public boundary is explicit, tested, and narrower than earlier direct model sharing

What still needs improvement:

- the auth-to-users contract is still too repository-shaped
- `users` does not yet own a truly separate profile model
- if the seam stays thin, the project should either introduce a real profile model or eventually merge the modules conceptually

### Products

Current strengths:

- domain creation/update logic exists
- repository is module-local
- scheduler startup was moved out of the HTTP route adapter

Current limitations:

- product record mapping is still pass-through
- product modeling is still patch-oriented rather than aggregate-oriented
- current stock/catalog rules are still too light to justify a heavier aggregate root today

### Categories

Current strengths:

- category creation rules live in the module
- category deletion goes through a product module contract instead of touching product infrastructure directly

Current limitations:

- category-to-product coordination is synchronous
- no domain event or ACL exists around category deletion
- category mapping is still pass-through even though the misleading `CategoryEntity` name has been removed

### Orders

Current strengths:

- create, read, update, and delete use cases exist
- order creation and update shaping live in domain code
- repository persists shaped objects rather than raw controller payloads
- order status transitions now go through explicit lifecycle rules
- address, money, order-status, and payment-status value objects exist

Current limitations:

- order domain is still thinner than a full aggregate root
- the order model still carries more payment detail than it should long-term
- there is no real order/payment workflow integration

### Payments

Current strengths:

- Stripe integration is isolated behind a gateway port
- webhook route is correctly left outside end-user auth
- payment session and checkout item domain objects now exist

Current limitations:

- the module is still closer to a gateway-backed workflow than a durable aggregate
- webhook verification does not update business state
- the module does not yet collaborate with orders through events or a narrow application contract

## Payments Persistence Decision

The current architectural decision is:

- `payments` should eventually own its own persistence model/collection

Why:

- webhook processing will need idempotency
- payment lifecycle state should not depend on a fresh Stripe read every time
- order/payment collaboration will need a stable internal payment record instead of a pure gateway pass-through

What this does not mean yet:

- the current codebase does not persist payment state today
- Stripe is still the runtime source for checkout-session lookups
- the persistence work remains a follow-up implementation step, not a completed migration

## Payments-to-Orders Collaboration Decision

The current architectural decision is:

- `payments` should update `orders` through event-driven collaboration, not by writing into order persistence directly

Why:

- payment confirmation is a workflow outcome, not a CRUD dependency
- direct payments-to-orders repository access would tighten module coupling again
- the order module should remain the owner of order status transitions and order-side payment invariants

Concretely, the intended flow is:

- `payments` emits a payment outcome event such as `PaymentConfirmed`
- `orders` consumes that event and performs its own state transition logic

What is still missing:

- an in-process event bus
- the first real event types and handlers
- a stable correlation key between payment records and orders across the checkout flow

## Order vs Payment Data Ownership

The current target boundary is:

- `orders` should keep only payment information that matters to order fulfillment decisions
- `payments` should own provider-specific and payment-lifecycle-specific details

`orders` should keep:

- order-facing payment status needed for order lifecycle rules
- the selected payment method as part of checkout intent
- a stable payment reference/correlation id that lets the order relate to a payment record

`payments` should own:

- provider session ids and provider transaction ids
- webhook delivery history and idempotency keys
- provider payload details and gateway-specific metadata
- the broader payment lifecycle record

That means the current order fields are too broad as they stand today:

- `transactionId` should move toward a payment-reference role instead of storing provider-specific transaction identity directly
- `paymentDetails` should move out of the order model and into the payments module once the event-driven seam is implemented

## Aggregate Candidates

The current codebase now has an explicit view of where true aggregates are actually justified:

- `orders` should be treated as the clearest aggregate candidate
- `products` is the next likely aggregate candidate if stock/catalog invariants become richer
- `payments` may become an aggregate only if payment state becomes persisted and lifecycle-driven
- `auth`, `users`, and `categories` do not currently need deeper aggregate modeling beyond their present scope

Why:

- `orders` already coordinates status transitions, payment-related fields, address, money, and product lines inside one consistency boundary
- `products` currently has pricing and stock-related rules, but not yet enough coupled invariants to justify a heavier aggregate root
- `payments` is still mostly an external-session workflow around Stripe, so a true aggregate would be premature until payment state is owned internally
- `auth`, `users`, and `categories` are currently dominated by CRUD and boundary orchestration rather than rich multi-entity consistency rules

## Product Aggregate Decision

The current architectural decision is:

- `products` does not need a richer aggregate root yet

Why:

- the current product rules are still limited to field validation, stock non-negativity, and discount/price recalculation
- there are no stronger inventory reservation rules, bundle rules, catalog publication workflows, or cross-entity stock invariants yet
- a heavier aggregate would add structure before the domain actually needs it

What would change this decision later:

- inventory reservation or oversell prevention
- richer stock lifecycle transitions
- multi-variant product rules
- catalog publication/review workflows

## Cross-Module Communication Today

Current patterns in use:

- synchronous contract calls through `public-api.js`
- app-level composition for auth verification middleware
- in-process domain/application events through a shared application event bus

Examples:

- `categories` publishes `CategoryDeleted`, and the current event handler translates that into product cleanup
- `users` depends on auth-backed account access because auth owns the credential-bearing account record

What is not in place yet:

- broader event coverage across more module seams
- payment-to-order event handling with stable correlation data
- anti-corruption layers between every diverging module language

## Shared and Bootstrap

Current shared code:

- `shared/application/errors/ApplicationError.js`
- `shared/domain/errors/DomainValidationError.js`
- `shared/infrastructure/http/HttpValidationError.js`
- shared HTTP middleware and helpers
- shared Mongo bootstrap utilities
- `shared/infrastructure/events/createInProcessEventBus.js`

Current shared-kernel decision:

- `shared/` should stay limited to generic primitives and technical infrastructure
- business validation, value objects, lifecycle rules, workflow services, and collaboration translators should stay module-local
- new shared primitives should be introduced only when a concept is truly generic across bounded contexts

Current bootstrap shape:

- `app/createApp.js` wires middleware and routes
- `app/startApplication.js` is the runtime bootstrap that connects Mongo, creates the app, starts runtime hooks, and listens
- `server.js` is now a thin entrypoint over that bootstrap

This is workable today, but the composition root is still split between app bootstrap and module-level runtime hooks.

## Testing Status

Current verified baseline:

- `npm test` in `backend/` passes
- current suite: `139 passing`

Current strengths:

- targeted unit tests exist for several domain objects and use cases
- app test covers Stripe webhook raw-body handling

Current gaps:

- module public API tests exist for `auth` and `products`
- contract coverage exists for repositories and the Stripe gateway
- limited adapter integration coverage
- only the first cross-module workflow test exists so far
- event-driven collaboration now has initial event-bus and handler coverage, but not broad workflow coverage yet

## Honest Architectural Assessment

The backend today is best described as:

> a modular monolith with hexagonal reconstruction in progress

That means:

- module boundaries exist
- the code is cleaner than a classic controller-service-repository monolith
- several direct infrastructure leaks were already removed

But also:

- domain purity is incomplete
- some cross-module contracts are still too persistence-shaped
- rich DDD building blocks are mostly absent
- payments is not yet a full business module
- cross-module workflows are still mostly synchronous and thin

## Target Direction

The intended next step is not a rewrite. It is a tightening of the current structure:

- narrow `public-api.js` to real capabilities
- keep `public-api.js` only where a real cross-module capability exists
- make domains framework-agnostic
- introduce value objects and richer aggregates where the business justifies them
- add domain/application events for cross-module workflows
- strengthen mapping and contract boundaries
- increase test depth around ports, adapters, and module collaboration
