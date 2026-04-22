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
│   └── use-cases/
├── domain/
├── infrastructure/
│   ├── http/
│   ├── persistence/ or repositories/ or gateways/
├── ports/
│   ├── input/
│   └── output/
├── composition.js
├── index.js
└── public-api.js
```

## What Each File Means Today

- `composition.js`
  - private module wiring
  - creates repositories, services, use cases, input ports, and HTTP handlers
- `index.js`
  - thin export surface used mostly by module-local HTTP route adapters and some bootstrap code
- `public-api.js`
  - intended cross-module surface
  - currently exists, but is still broader than it should be in several modules

## Layering Status

### Domain

What exists:

- domain constructor functions
- validation helpers
- some domain-shaped creation/update logic

What is still weak:

- domain objects are mostly thin frozen objects with `toPrimitives()`
- rich DDD building blocks are still mostly absent
- aggregates, value objects, domain services, and domain events are mostly absent

### Application

What exists:

- module-local use cases under `application/use-cases`
- use cases coordinate repositories and gateways
- several CRUD flows are cleaner than before

What is still weak:

- most use cases are still CRUD-oriented orchestration
- commands, queries, DTOs, and event handlers are not clearly separated
- cross-module workflows are mostly synchronous and request/response shaped

### Ports

What exists:

- input ports for all main modules
- output ports for repositories, token services, and payment gateway access

What is still weak:

- ports are mostly runtime assertion helpers
- many public contracts are too broad
- there are no dedicated contract tests proving adapter conformance

### Infrastructure

What exists:

- module-local HTTP routes and controllers
- module-local repositories and persistence models
- Stripe gateway adapter in `payments`
- auth JWT and OAuth adapters
- Mongo connection and shared HTTP middleware under `shared/`

What is still weak:

- some repositories still return raw records through pass-through mappers
- mapping layers are thin and do not yet form strong anti-corruption boundaries
- bootstrap wiring is cleaner, but there is still no strict single composition root for all runtime concerns

## Module-by-Module Snapshot

### Auth

Current strengths:

- registration, login, and access-token verification are use-case driven
- JWT handling is behind a token service port
- OAuth adapter is separated into infrastructure

Current limitations:

- the auth/users boundary still needs a clearer ownership decision
- auth still exposes repository-style account access methods across the boundary
- dedicated value objects for email and password policy are still missing

### Users

Current strengths:

- use cases exist for lookup, update, password update, and delete
- user repository is separated from HTTP concerns

Current limitations:

- the module depends on the auth module for data access
- the auth/users boundary is cleaner than direct model sharing, but still persistence-shaped
- user domain modeling is very thin

### Products

Current strengths:

- domain creation/update logic exists
- repository is module-local
- scheduler startup was moved out of the HTTP route adapter

Current limitations:

- product record mapping is still pass-through
- product modeling is still patch-oriented rather than aggregate-oriented
- no richer stock/catalog aggregate behavior exists yet

### Categories

Current strengths:

- category creation rules live in the module
- category deletion goes through a product module contract instead of touching product infrastructure directly

Current limitations:

- category-to-product coordination is synchronous
- no domain event or ACL exists around category deletion
- `CategoryEntity` is still effectively a pass-through mapper

### Orders

Current strengths:

- create, read, update, and delete use cases exist
- order creation and update shaping live in domain code
- repository persists shaped objects rather than raw controller payloads

Current limitations:

- order domain is still a thin object factory plus patch builder
- there are no explicit state-transition methods
- payment-related fields live on the order model, but there is no real order/payment workflow integration

### Payments

Current strengths:

- Stripe integration is isolated behind a gateway port
- webhook route is correctly left outside end-user auth

Current limitations:

- there is effectively no payment domain yet
- the module is mostly a Stripe adapter wrapped in a module
- webhook verification does not update business state
- the module does not yet collaborate with orders through events or a narrow application contract

## Cross-Module Communication Today

Current patterns in use:

- synchronous contract calls through `public-api.js`
- app-level composition for auth verification middleware

Examples:

- `categories` calls a narrowed product capability to remove products by category
- `users` depends on auth-backed user account access

What is not in place yet:

- domain events
- application events
- async module collaboration
- anti-corruption layers between module languages

## Shared and Bootstrap

Current shared code:

- `shared/domain/errors/ApiError.js`
- `shared/infrastructure/http/HttpValidationError.js`
- shared HTTP middleware and helpers
- shared Mongo bootstrap utilities

Current bootstrap shape:

- `app/createApp.js` wires middleware and routes
- `server.js` connects Mongo, starts the app, and starts the product scheduler

This is workable today, but the composition root is still split between app bootstrap and module-level runtime hooks.

## Testing Status

Current verified baseline:

- `npm test` in `backend/` passes
- current suite: `79 passing`

Current strengths:

- targeted unit tests exist for several domain objects and use cases
- app test covers Stripe webhook raw-body handling

Current gaps:

- module public API tests exist for `auth` and `products`
- contract coverage exists for the Stripe gateway and the users repository
- limited adapter integration coverage
- no cross-module workflow tests
- no tests around event-driven collaboration because eventing is not implemented yet

## Honest Architectural Assessment

The backend today is best described as:

> a modular monolith with hexagonal reconstruction in progress

That means:

- module boundaries exist
- the code is cleaner than a classic controller-service-repository monolith
- several direct infrastructure leaks were already removed

But also:

- domain purity is incomplete
- public module APIs are still too broad
- rich DDD building blocks are mostly absent
- payments is not yet a full business module
- cross-module workflows are still mostly synchronous and thin

## Target Direction

The intended next step is not a rewrite. It is a tightening of the current structure:

- narrow `public-api.js` to real capabilities
- make domains framework-agnostic
- introduce value objects and richer aggregates where the business justifies them
- add domain/application events for cross-module workflows
- strengthen mapping and contract boundaries
- increase test depth around ports, adapters, and module collaboration
