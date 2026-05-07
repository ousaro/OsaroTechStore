# Backend System Design Choices

This document records the backend design choices currently implemented in
`backend/src`. It should be read with
[`backend-dependency-graph.md`](./backend-dependency-graph.md), which shows the
runtime wiring.

## Current Implementation Status

| Choice | Status | Code location |
| --- | --- | --- |
| Modular hexagonal backend | Implemented | `backend/src/modules/*` |
| Single composition root | Implemented | `backend/src/infrastructure/bootstrap/configureApplicationModules.js` |
| Provider-based infrastructure selection | Implemented for Mongo, Stripe, disabled payments, console logger, in-process event bus, Redis event bus | `backend/src/infrastructure/providers/*` |
| Cross-module workflows via events | Implemented | `backend/src/modules/*/adapters/input/collaboration` |
| HTTP as an input adapter | Implemented | `backend/src/modules/*/adapters/input/http` |
| Repository ports and Mongoose adapters | Implemented | `backend/src/modules/*/ports/output`, `backend/src/modules/*/adapters/output/repositories/mongo` |
| OpenAPI documentation endpoint | Implemented | `backend/src/shared/infrastructure/http/openApiDocs.js` |
| Health and readiness endpoints | Implemented | `backend/src/shared/infrastructure/http/healthRoutes.js` |
| Redis event bus wiring | Implemented startup lifecycle; needs production delivery hardening | `redisStreamEventBus.js`, `redisClient.js` |
| Production-safe request logging | Implemented | `requestLoggingMiddleware.js` |
| Architecture boundary guard tests | Implemented | `backend/tests/unit/architecture/module-boundaries.test.js` |

## 1. Architecture Style: Modular Hexagonal

The backend is organized around business modules rather than technical layers.
Each module owns its domain model, application use cases, ports, HTTP adapter,
and persistence adapter.

The intended dependency direction is:

```text
HTTP/collaboration adapters -> input port -> use cases -> domain
use cases -> output ports -> infrastructure adapters
```

Modules should not import another module's domain, use cases, repositories, or
models directly. Cross-module behavior goes through events and collaboration
translators registered by the composition root.

Why this choice:

- Keeps product, category, order, payment, user, and auth rules independently
  testable.
- Allows infrastructure to change behind ports without rewriting module logic.
- Makes the dependency graph explicit at startup instead of hidden behind
  globals or singletons.

## 2. Composition Root Owns Runtime Wiring

`configureApplicationModules.js` is the only file that knows the full backend
dependency graph.

It is responsible for:

- Resolving infrastructure providers from environment configuration.
- Connecting the database.
- Creating repositories.
- Creating module instances.
- Registering cross-module event workflows.
- Returning route factories and shutdown hooks to the app bootstrap.

This keeps `createApp.js` focused on Express concerns only. The Express app gets
pre-wired route factories and shared middleware dependencies; it does not know
about domain modules, repositories, providers, or use cases.

## 3. Configuration and Provider Strategy

Runtime choices are centralized in `backend/src/infrastructure/config/env.js`.
Provider resolvers translate those choices into concrete adapters:

- `DATABASE_PROVIDER=mongo` is implemented.
- `PAYMENT_PROVIDER=stripe` and `PAYMENT_PROVIDER=disabled` are implemented.
- `LOGGER_PROVIDER=console` is implemented.
- `EVENT_BUS_PROVIDER=inprocess` and `EVENT_BUS_PROVIDER=redis` are implemented.

Provider names should only appear in supported-provider messages after the
adapter is usable. Postgres and PayPal are intentionally not advertised until
real providers exist.

The rule for adding a provider is: implement an adapter behind the existing
port, assert the port in the resolver, then add a resolver case. Module code
should not change for a provider swap.

## 4. Persistence Choice: Mongo Through Repositories

MongoDB with Mongoose is the implemented persistence strategy. The rest of the
backend talks to repository ports, not directly to Mongoose models.

Current repository adapter pattern:

- Mongoose schema/model in `adapters/output/persistence/mongo`.
- Record mapper beside the model.
- Repository implementation in `adapters/output/repositories/mongo`.
- Repository instances created from `createMongooseRepositories.js`.

This allows tests and future persistence providers to replace repositories at
the composition boundary.

## 5. Payments Choice: Workflow Module Plus Gateway Port

Payments are modeled as their own module with a payment gateway output port.
Stripe is the implemented gateway, and disabled payments are a first-class
runtime mode for local and test environments.

Stripe-specific details stop at the Stripe adapter and payload translator:

- Checkout session creation maps internal order/payment data to Stripe.
- Webhook payloads map Stripe events back to internal payment state changes.
- The payment module publishes internal payment events rather than leaking
  Stripe event names into orders.

PayPal should be added to configuration messages only after a real adapter
exists.

## 6. Cross-Module Workflows Use Events

Modules do not call each other directly. The composition root subscribes
collaboration translators to the event bus:

- `OrderPlaced` tells Payments to link or prepare payment state for an order.
- `CategoryDeleted` tells Products to remove products in that category.
- `PaymentConfirmed`, `PaymentFailed`, and `PaymentExpired` tell Orders to sync
  payment outcome.

The translator names are intentionally business-oriented. Their job is to turn
an event from one module into a command on another module's public input
surface.

## 7. HTTP Adapter Choice

HTTP routes are input adapters. Controllers should translate request/response
details, call input ports, and let shared middleware normalize errors.

Implemented global HTTP concerns:

- Request IDs.
- Safe request completion logging with request ID, method, route, status, and
  latency.
- CORS and cookies.
- JSON body parsing, with a raw-body exception for Stripe webhooks.
- Auth middleware shared across protected routes.
- OpenAPI docs registration.
- 404 and error middleware registered last.

Controllers should not reach into repositories or infrastructure directly.

## 8. Error and Validation Boundaries

The backend separates:

- Domain errors for invalid business state.
- Application errors for use case and service-level failures.
- HTTP error mapping in shared infrastructure.
- Assertion helpers and port assertions in shared kernel/application code.

This keeps business failures independent from Express response formatting.

## 9. Testing Strategy

The backend already has layered tests:

- Unit tests for domain objects, use cases, ports, providers, routes, and
  controllers.
- Integration tests around authenticated HTTP workflows and persistence.
- Collaboration tests for event-driven workflows.
- Cucumber e2e tests for user-facing authentication and checkout behavior.

New architecture changes should include tests at the lowest layer that proves
the behavior, plus integration coverage when a route, provider resolver, or
cross-module workflow changes.
